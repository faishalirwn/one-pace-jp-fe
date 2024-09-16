"use client";

import { getProcessStatus, getSub } from "@/app/_utils/api";
import { paths } from "@/app/_utils/api-types";
import { ProcessStatus, Transcription } from "@/app/_utils/types";
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
    isProcessClicked,
    initialTranscription,
    initialProcessStatus,
    setIsProcessClicked,
}: {
    sessionId: string;
    isProcessClicked: boolean;
    initialTranscription: Transcription;
    initialProcessStatus: ProcessStatus;
    setIsProcessClicked: Dispatch<SetStateAction<boolean>>;
}) {
    const [processStatus, setProcessStatus] =
        useState<ProcessStatus>(initialProcessStatus);
    const [transcription, setTranscription] =
        useState<Transcription>(initialTranscription);

    const isProcessFinished = processStatus === "finished";
    console.log("SubTable", isProcessClicked);

    useEffect(() => {
        if (isProcessClicked) {
            const intervalId = setInterval(() => {
                getProcessStatus(sessionId).then((status) => {
                    setProcessStatus(status);
                });
                if (isProcessFinished) {
                    getSub(sessionId).then((transcription) => {
                        setTranscription(transcription);
                    });
                    setIsProcessClicked(false);
                }
            }, 5000);
            return () => clearInterval(intervalId);
        }
    }, [
        isProcessClicked,
        sessionId,
        processStatus,
        setIsProcessClicked,
        isProcessFinished,
    ]);

    return (
        <>
            {isProcessClicked && <p>{getStatusMessage(processStatus)}</p>}

            <p>{`clicked = ${isProcessClicked}`}</p>
            {isProcessFinished && (
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
            )}
        </>
    );
}
