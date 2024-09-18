"use client";

import {
    FormInitialValues,
    ProcessStatus,
    Transcription,
} from "../_utils/types";
import FilesForm from "./main/FilesForm";
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
    return (
        <div>
            <FilesForm initialFiles={initialFiles} />
            {/* TODO: The problem is filesform redirects and rerenders all from the server component including the state,
            on sessionId route it only rerenders mainwindow and preserve the state
            - REMOVE isProcessClicked. just use transcription status.
             */}
            {sessionId && initialProcessStatus && (
                <>
                    <SubTable
                        sessionId={sessionId}
                        initialTranscription={initialTranscription}
                        initialProcessStatus={initialProcessStatus}
                    />

                    <p>Get Sub</p>
                    <p>...</p>
                </>
            )}
        </div>
    );
}
