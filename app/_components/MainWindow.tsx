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
    initialProcessStatus,
}: {
    sessionId?: string;
    initialFiles?: FormInitialValues;
    initialTranscription?: Transcription;
    initialProcessStatus?: ProcessStatus;
}) {
    const [isProcessClicked, setIsProcessClicked] = useState(false);
    console.log("MainWindow", isProcessClicked);

    return (
        <div>
            <FilesForm
                initialFiles={initialFiles}
                setIsProcessClicked={setIsProcessClicked}
            />
            {sessionId && initialProcessStatus && (
                <>
                    <SubTable
                        sessionId={sessionId}
                        isProcessClicked={isProcessClicked}
                        initialTranscription={initialTranscription}
                        initialProcessStatus={initialProcessStatus}
                        setIsProcessClicked={setIsProcessClicked}
                    />

                    <p>Get Sub</p>
                    <p>...</p>
                </>
            )}
        </div>
    );
}
