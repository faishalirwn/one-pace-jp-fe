"use client";

import { fetchData, getProcessStatus, getSub } from "@/app/_utils/api";
import { paths } from "@/app/_utils/api-types";
import { ProcessStatus, Transcription } from "@/app/_utils/types";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import VideoPreview, { VideoPreviewRef } from "./VideoPreview";

const statusMessages: Record<ProcessStatus, string> = {
    processing: "Task is in progress...",
    finished: "Task completed successfully!",
    not_started: "Task not started!",
};

function getStatusMessage(status: ProcessStatus) {
    return statusMessages[status] || "Unknown status, please wait...";
}

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
    const [videoEndTime, setVideoEndTime] = useState(0);
    const [isVideoExist, setIsVideoExist] = useState(false);

    const videoPlayerRef = useRef<VideoPreviewRef>(null);

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

    const updateTranscriptionRow = (
        transcription: Transcription,
        rowIndex: number,
        newMatch: string,
        newMerge: boolean
    ): Transcription => {
        if (!transcription) return transcription;

        return {
            ...transcription,
            transcription: transcription.transcription.map((row, index) => {
                if (index === rowIndex) {
                    return {
                        ...row,
                        match: newMatch,
                        merge: newMerge,
                    };
                }
                return row;
            }),
        };
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

    useEffect(() => {
        const saveSub = async () => {
            if (transcription) {
                const subMatches = transcription.transcription.map((row) => {
                    return (({ match, merge }) => ({ match, merge }))(row);
                });
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
            }
        };

        saveSub();
    }, [sessionId, transcription]);

    return (
        <>
            <div className="flex flex-col justify-center items-center mt-5">
                {processStatus === "processing" && (
                    <>
                        <p>{getStatusMessage(processStatus)}</p>
                        <p>{`${processedLines[0]}, ${processedLines[1]}`}</p>
                    </>
                )}

                {/* <p>{`processStatus = ${processStatus}`}</p>
            <p>{`transcription = ${transcription}`}</p> */}

                <Link
                    href={`${process.env.NEXT_PUBLIC_BASE_URL}/download-sub/${sessionId}`}
                    className="border border-white rounded p-1"
                >
                    Download Sub
                </Link>
            </div>
            <div className="sticky top-0 inline-block">
                <p>Local Video Preview</p>
                <VideoPreview
                    ref={videoPlayerRef}
                    endTime={videoEndTime}
                    onFileChange={handleVideoFileChange}
                />
            </div>

            {processStatus === "finished" && (
                <>
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
                            {transcription?.transcription.map((row, index) => {
                                let matches;
                                if (row.matches.length === 0) {
                                    matches = <span>None</span>;
                                } else {
                                    matches = row.matches.map((match) => {
                                        return (
                                            <span
                                                className="rounded border-white border p-1 cursor-pointer"
                                                onClick={() => {
                                                    setTranscription(
                                                        (prevTranscription) =>
                                                            updateTranscriptionRow(
                                                                prevTranscription,
                                                                index,
                                                                match.matched_text,
                                                                row.merge
                                                            )
                                                    );
                                                }}
                                                key={`${row.ori_text}${match.matched_text}`}
                                            >
                                                {match.matched_text}
                                            </span>
                                        );
                                    });
                                }

                                const matchesContainer = (
                                    <div>
                                        <div className="flex justify-center gap-x-2 mb-2">
                                            <div className="flex items-center gap-x-2">
                                                <label
                                                    htmlFor={`merge-${index}`}
                                                >
                                                    Merge
                                                </label>
                                                <input
                                                    type="checkbox"
                                                    name={`merge-${index}`}
                                                    id={`merge-${index}`}
                                                    checked={row.merge}
                                                    onChange={(e) => {
                                                        setTranscription(
                                                            (
                                                                prevTranscription
                                                            ) =>
                                                                updateTranscriptionRow(
                                                                    prevTranscription,
                                                                    index,
                                                                    row.match,
                                                                    e.target
                                                                        .checked
                                                                )
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <textarea
                                                className="bg-black border border-white rounded p-1"
                                                name="match"
                                                rows={3}
                                                cols={60}
                                                value={row.match ?? ""}
                                                onChange={(e) => {
                                                    setTranscription(
                                                        (prevTranscription) =>
                                                            updateTranscriptionRow(
                                                                prevTranscription,
                                                                index,
                                                                e.target.value,
                                                                row.merge
                                                            )
                                                    );
                                                }}
                                            ></textarea>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {matches}
                                        </div>
                                    </div>
                                );

                                return (
                                    <tr key={row.ori_text}>
                                        {isVideoExist && (
                                            <td className="p-2">
                                                <button
                                                    onClick={() => {
                                                        handlePlayClick(
                                                            parseInt(
                                                                row.start_time
                                                            ) / 1000,
                                                            parseInt(
                                                                row.end_time
                                                            ) / 1000
                                                        );
                                                    }}
                                                >
                                                    Play
                                                </button>
                                            </td>
                                        )}
                                        <td className="p-2">
                                            {row.start_time}
                                        </td>
                                        <td className="p-2">{row.end_time}</td>
                                        <td className="p-2">{row.ori_text}</td>
                                        <td className="p-2">{row.text}</td>
                                        <td className="p-2">
                                            {matchesContainer}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </>
            )}
        </>
    );
}
