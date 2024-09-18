"use client";

import { fetchData, getProcessStatus, getSub } from "@/app/_utils/api";
import { paths } from "@/app/_utils/api-types";
import { ProcessStatus, Transcription } from "@/app/_utils/types";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

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
            {processStatus === "processing" && (
                <>
                    <p>{getStatusMessage(processStatus)}</p>
                    <p>{`${processedLines[0]}, ${processedLines[1]}`}</p>
                </>
            )}

            <p>{`processStatus = ${processStatus}`}</p>
            <p>{`transcription = ${transcription}`}</p>
            {processStatus === "finished" && (
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>start time</th>
                                <th>end time</th>
                                <th>ori text</th>
                                <th>transcription</th>
                                <th>match</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transcription?.transcription.map((row) => {
                                const matches = row.matches
                                    .map((match) => match.matched_text)
                                    .join(", ");
                                return (
                                    <tr key={row.start_time}>
                                        <td>{row.start_time}</td>
                                        <td>{row.end_time}</td>
                                        <td>{row.ori_text}</td>
                                        <td>{row.text}</td>
                                        <td>{matches}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <button>Save Sub</button>
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
