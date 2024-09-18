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

    const videoRef = useRef<VideoPreviewRef>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    // const [currentTime, setCurrentTime] = useState(0);

    const togglePlay = (time: number) => {
        // handleTimeUpdate(1000);
        videoRef.current?.setCurrentTime(time / 1000);
        if (!isPlaying) {
            // if (videoRef.current?.isPaused) {
            videoRef.current?.play();
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
            videoRef.current?.pause();
        }
    };

    // const handleTimeUpdate = (time: number) => {
    //     setCurrentTime(time);
    // };

    return (
        <>
            {processStatus === "processing" && (
                <>
                    <p>{getStatusMessage(processStatus)}</p>
                    <p>{`${processedLines[0]}, ${processedLines[1]}`}</p>
                </>
            )}

            <p>{`processStatus = ${processStatus}`}</p>
            <p>{`transcription = ${transcription}`}</p>

            <VideoPreview ref={videoRef} />

            {processStatus === "finished" && (
                <>
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>start time</th>
                                <th>end time</th>
                                <th>ori text</th>
                                <th>transcription</th>
                                <th>match</th>
                            </tr>
                        </thead>
                        <tbody>
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
                                        {row.matches.length !== 0 && (
                                            <>
                                                <div className="flex items-center">
                                                    <label
                                                        htmlFor={`merge-${index}`}
                                                    >
                                                        Merge with next row
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
                                                <input
                                                    className="bg-black border border-white rounded p-1"
                                                    name="match"
                                                    type="text"
                                                    value={row.match ?? ""}
                                                    onChange={(e) => {
                                                        setTranscription(
                                                            (
                                                                prevTranscription
                                                            ) =>
                                                                updateTranscriptionRow(
                                                                    prevTranscription,
                                                                    index,
                                                                    e.target
                                                                        .value,
                                                                    row.merge
                                                                )
                                                        );
                                                    }}
                                                />
                                            </>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {matches}
                                        </div>
                                    </div>
                                );

                                return (
                                    <tr key={row.ori_text}>
                                        <td>
                                            <button
                                                onClick={() => {
                                                    togglePlay(
                                                        parseInt(row.start_time)
                                                    );
                                                }}
                                            >
                                                Play
                                            </button>
                                        </td>
                                        <td>{row.start_time}</td>
                                        <td>{row.end_time}</td>
                                        <td>{row.ori_text}</td>
                                        <td>{row.text}</td>
                                        <td>{matchesContainer}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <Link
                        href={`${process.env.NEXT_PUBLIC_BASE_URL}/download-sub/${sessionId}`}
                    >
                        Download Sub
                    </Link>
                </>
            )}
        </>
    );
}
