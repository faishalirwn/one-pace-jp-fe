"use client";

import { fetchData, getProcessStatus, getSub } from "@/app/_utils/api";
import { paths } from "@/app/_utils/api-types";
import {
    ProcessStatus,
    SubMatches,
    SubMatchesPartial,
    Transcription,
} from "@/app/_utils/types";
import Link from "next/link";
import {
    Dispatch,
    memo,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import VideoPreview, { VideoPreviewRef } from "./VideoPreview";

const statusMessages: Record<ProcessStatus, string> = {
    processing: "Task is in progress...",
    finished: "Task completed successfully!",
    not_started: "Task not started!",
};

function getStatusMessage(status: ProcessStatus) {
    return statusMessages[status] || "Unknown status, please wait...";
}

interface TranscriptionRowProps {
    rowData: SubMatches;
    rowIndex: number;
    isVideoExist: boolean;
    onRowUpdate: (rowIndex: number, updatedRow: SubMatches) => void;
    handlePlayClick: (startTime: number, endTime: number) => void;
}

const TranscriptionRow = memo(
    ({
        rowData,
        rowIndex,
        isVideoExist,
        onRowUpdate,
        handlePlayClick,
    }: TranscriptionRowProps) => {
        const [localRow, setLocalRow] = useState(rowData);

        const handleMatchChange = (newMatch: string) => {
            setLocalRow((prevRow) => ({ ...prevRow, match: newMatch }));
            onRowUpdate(rowIndex, { ...localRow, match: newMatch });
        };

        const handleMergeChange = (newMerge: boolean) => {
            setLocalRow((prevRow) => ({ ...prevRow, merge: newMerge }));
            onRowUpdate(rowIndex, { ...localRow, merge: newMerge });
        };

        const matches =
            rowData.matches.length === 0 ? (
                <span>None</span>
            ) : (
                rowData.matches.map((match) => (
                    <span
                        className="rounded border-white border p-1 cursor-pointer"
                        onClick={() => handleMatchChange(match.matched_text)}
                        key={`${rowData.ori_text}${match.matched_text}`}
                    >
                        {match.matched_text}
                    </span>
                ))
            );

        return (
            <tr>
                {isVideoExist && (
                    <td className="p-2">
                        <button
                            onClick={() =>
                                handlePlayClick(
                                    parseInt(rowData.start_time) / 1000,
                                    parseInt(rowData.end_time) / 1000
                                )
                            }
                        >
                            Play
                        </button>
                    </td>
                )}
                <td className="p-2">{rowData.start_time}</td>
                <td className="p-2">{rowData.end_time}</td>
                <td className="p-2">{rowData.ori_text}</td>
                <td className="p-2">{rowData.text}</td>
                <td className="p-2">
                    <div>
                        <div className="flex justify-center gap-x-2 mb-2">
                            <div className="flex items-center gap-x-2">
                                <label htmlFor={`merge-${rowIndex}`}>
                                    Merge
                                </label>
                                <input
                                    type="checkbox"
                                    name={`merge-${rowIndex}`}
                                    id={`merge-${rowIndex}`}
                                    onChange={(e) =>
                                        handleMergeChange(e.target.checked)
                                    }
                                />
                            </div>
                            <textarea
                                className="bg-black border border-white rounded p-1"
                                name="match"
                                rows={3}
                                cols={60}
                                value={localRow.match ?? ""}
                                onChange={(e) =>
                                    handleMatchChange(e.target.value)
                                }
                            ></textarea>
                        </div>
                        <div className="flex flex-wrap gap-2">{matches}</div>
                    </div>
                </td>
            </tr>
        );
    }
);

TranscriptionRow.displayName = "TranscriptionRow";

export default function SubTable({
    sessionId,
    initialTranscription,
    initialProcessStatus,
    isProcessClicked,
    setIsProcessClicked,
}: {
    sessionId: string;
    initialTranscription: Transcription;
    initialProcessStatus: ProcessStatus;
    isProcessClicked: boolean;
    setIsProcessClicked: Dispatch<SetStateAction<boolean>>;
}) {
    const [processStatus, setProcessStatus] =
        useState<ProcessStatus>(initialProcessStatus);
    const [processedLines, setProcessedLines] = useState<[number, number]>([
        0, 0,
    ]);
    const [transcription, setTranscription] =
        useState<Transcription>(initialTranscription);
    const [transcriptionRows, setTranscriptionRows] = useState<
        SubMatches[] | undefined
    >(transcription?.transcription);
    const [videoEndTime, setVideoEndTime] = useState(0);
    const [isVideoExist, setIsVideoExist] = useState(false);

    const videoPlayerRef = useRef<VideoPreviewRef>(null);
    const updatedRowsRef = useRef<{ [key: number]: SubMatches }>({});

    const handleRowUpdate = useCallback(
        (rowIndex: number, updatedRow: SubMatches) => {
            updatedRowsRef.current[rowIndex] = updatedRow;
        },
        []
    );

    const handlePlayClick = (startTime: number, endTime: number) => {
        if (videoPlayerRef.current) {
            setVideoEndTime(endTime);
            videoPlayerRef.current.setCurrentTime(startTime);
            videoPlayerRef.current.playVideo();
        }
    };

    const handleVideoFileChange = (src: string) => {
        setIsVideoExist(src !== "");
    };

    const saveTranscription = async () => {
        if (!transcription) return;

        const updatedTranscription = transcription.transcription.map(
            (row, index) => updatedRowsRef.current[index] || row
        );

        setTranscription((prev) => {
            if (!prev) return;

            return {
                ...prev,
                transcription: updatedTranscription,
            };
        });

        const subMatches = updatedTranscription.map((row) => ({
            match: row.match,
            merge: row.merge,
        }));

        await fetchData<
            paths["/sub/{session_id}"]["put"]["responses"]["200"]["content"]["application/json"]
        >(`/sub/${sessionId}`, {
            method: "PUT",
            body: JSON.stringify({
                transcription: subMatches,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Clear the updatedRowsRef after saving
        updatedRowsRef.current = {};
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (processStatus === "processing" || isProcessClicked) {
            intervalId = setInterval(async () => {
                const statusRes = await getProcessStatus(sessionId);
                const status = statusRes.status;
                setProcessedLines([statusRes.processed, statusRes.total]);

                if (status === "finished") {
                    clearInterval(intervalId);
                    setProcessStatus(status);
                    const newTranscriptionRes = await getSub(sessionId);
                    const newTranscription = newTranscriptionRes.transcription;
                    setTranscription(newTranscription);
                    setIsProcessClicked(false);
                } else {
                    setProcessStatus(status);
                }
            }, 5000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isProcessClicked, processStatus, sessionId, setIsProcessClicked]);

    return (
        <>
            <div className="flex flex-col justify-center items-center mt-5">
                {processStatus === "processing" && (
                    <>
                        <p>{getStatusMessage(processStatus)}</p>
                        <p>{`${processedLines[0]}, ${processedLines[1]}`}</p>
                    </>
                )}

                {processStatus === "finished" && (
                    <div className="flex gap-x-2">
                        <button
                            onClick={saveTranscription}
                            className="border border-white rounded p-1"
                        >
                            Save Changes
                        </button>
                        <Link
                            href={`${process.env.NEXT_PUBLIC_BASE_URL}/download-sub/${sessionId}`}
                            className="border border-white rounded p-1"
                        >
                            Download Sub
                        </Link>
                    </div>
                )}
            </div>

            {processStatus === "finished" && (
                <>
                    <div className="sticky top-0 inline-block">
                        <p>Local Video Preview</p>
                        <VideoPreview
                            ref={videoPlayerRef}
                            endTime={videoEndTime}
                            onFileChange={handleVideoFileChange}
                        />
                    </div>
                    <table>
                        <thead>
                            <tr>
                                {isVideoExist && <th></th>}

                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Original Sub</th>
                                <th>Transcription</th>
                                <th>Matched Subs</th>
                            </tr>
                        </thead>
                        <tbody className="align-top">
                            {transcription?.transcription.map((row, index) => (
                                <TranscriptionRow
                                    key={`${index}-${row.ori_text}`}
                                    rowData={row}
                                    rowIndex={index}
                                    isVideoExist={isVideoExist}
                                    onRowUpdate={handleRowUpdate}
                                    handlePlayClick={handlePlayClick}
                                />
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </>
    );
}
