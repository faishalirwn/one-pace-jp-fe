"use client";

import { getProcessStatus, getSub } from "@/app/_utils/api";
import { ProcessStatus, Transcription } from "@/app/_utils/types";
import { useEffect, useState } from "react";

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
}: {
    sessionId: string;
    initialTranscription: Transcription;
    initialProcessStatus: ProcessStatus;
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

        if (processStatus === "processing") {
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
    }, [processStatus, sessionId]);

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
                </>
            )}
        </>
    );
}
