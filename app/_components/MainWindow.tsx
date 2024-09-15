"use client";

import axios from "axios";
import FilesForm from "./main/FilesForm";
import { FormInitialValues } from "../_utils/types";
import { useState } from "react";
import SubTable from "./main/SubTable";

export default function MainWindow({
    sessionId,
    initialFiles,
}: {
    sessionId: string;
    initialFiles?: FormInitialValues;
}) {
    const [isProcessClicked, setIsProcessClicked] = useState(false);

    return (
        <div>
            <FilesForm
                initialFiles={initialFiles}
                setIsProcessClicked={setIsProcessClicked}
            />
            {sessionId && (
                <>
                    <SubTable
                        sessionId={sessionId}
                        isProcessClicked={isProcessClicked}
                    />

                    <p>Get Sub</p>
                    <p>...</p>
                </>
            )}
        </div>
    );
}
