"use client";

import FilesForm from "./main/FilesForm";
import {
    FormInitialValues,
    ProcessStatus,
    Transcription,
} from "../_utils/types";
import { useState } from "react";
import SubTable from "./main/SubTable";

export default function MainWindow({
    sessionId,
    initialFiles,
    initialTranscription,
    initialProcessStatus = "not_started",
}: {
    sessionId?: string;
    initialFiles?: FormInitialValues;
    initialTranscription?: Transcription;
    initialProcessStatus?: ProcessStatus;
}) {
    const [isProcessClicked, setIsProcessClicked] = useState(false);

    return (
        <div className="p-2">
            <FilesForm
                initialFiles={initialFiles}
                setIsProcessClicked={setIsProcessClicked}
            />
            {sessionId && initialProcessStatus && (
                <>
                    <SubTable
                        sessionId={sessionId}
                        initialTranscription={initialTranscription}
                        initialProcessStatus={initialProcessStatus}
                        isProcessClicked={isProcessClicked}
                        setIsProcessClicked={setIsProcessClicked}
                    />
                </>
            )}
        </div>
    );
}
