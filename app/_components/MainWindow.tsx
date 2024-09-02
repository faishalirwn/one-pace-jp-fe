"use client";

import axios from "axios";
import React, { forwardRef, useRef, useState } from "react";

async function uploadFile(
    files: File[],
    uploadProgressCb: (progress: number) => void
) {
    try {
        const data = new FormData();
        files.forEach((file) => {
            data.append("files", file);
        });
        const res = await axios.post("http://127.0.0.1:8000/test", data, {
            onUploadProgress: (progressEvent) => {
                if (progressEvent.progress) {
                    const progress = parseFloat(
                        (progressEvent.progress * 100).toFixed(2)
                    );
                    uploadProgressCb(progress);
                }
            },
        });
        return res.data.filename;
        // TODO: from server standard way to say it succeed or failed, temporary true false
        return true;
    } catch (error) {
        return false;
    }
}

type FileInputProps = {
    name: string;
    uploadProgress?: number;
    fileName?: string;
    isMultiple?: boolean;
    isDisabled?: boolean;
    onChange: (files: FileList) => void;
};

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
    function FileInput(
        {
            name,
            uploadProgress = 0,
            fileName = undefined,
            isMultiple = false,
            isDisabled = false,
            onChange,
        }: FileInputProps,
        ref
    ) {
        return (
            <div>
                <p>{name}</p>
                <input
                    ref={ref}
                    type="file"
                    name={name}
                    id={name}
                    disabled={isDisabled}
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length !== 0) {
                            onChange(e.target.files);
                        }
                    }}
                    multiple={isMultiple}
                />
                <div>
                    {uploadProgress !== 0 && uploadProgress !== 100 && (
                        <p>{uploadProgress}%</p>
                    )}
                    {fileName && <p>{fileName}</p>}
                </div>
            </div>
        );
    }
);

export default function MainWindow() {
    const AUDIO_INPUT = "AUDIO";
    const ORI_SUB_INPUT = "ORI";
    const REF_SUB_INPUT = "REF";

    const inputsRef = useRef<{
        [key: string]: HTMLInputElement | null;
    }>({});

    const [disabledStates, setDisabledStates] = useState<{
        [key: string]: boolean;
    }>({});
    const [uploadProgress, setUploadProgress] = useState<{
        [key: string]: number;
    }>({});
    const [uploadedFiles, setUploadedFiles] = useState<{
        [key: string]: string;
    }>({});

    const handleFileChange = async (inputName: string, files: FileList) => {
        setDisabledStates((prev) => ({
            ...prev,
            [inputName]: true,
        }));
        const filename = await uploadFile(Array.from(files), (progress) => {
            setUploadProgress((prev) => ({
                ...prev,
                [inputName]: progress,
            }));
        });
        console.log(filename);
        console.log(inputsRef);
        console.log(inputsRef.current[inputName]);

        if (inputsRef.current[inputName]) {
            inputsRef.current[inputName].value = "";
        }

        setUploadedFiles((prev) => ({
            ...prev,
            [inputName]: filename,
        }));
        setDisabledStates((prev) => ({
            ...prev,
            [inputName]: false,
        }));
    };

    const setInputRef =
        (inputName: string) => (element: HTMLInputElement | null) => {
            inputsRef.current[inputName] = element;
        };

    return (
        <div>
            {/* TODO: file input: persist after upload, can remove, progress bar, 
            if persist or upload complete the remove first then you can change unless it's multiple allowed */}
            <FileInput
                name="Audio"
                ref={setInputRef(AUDIO_INPUT)}
                isDisabled={disabledStates[AUDIO_INPUT]}
                uploadProgress={uploadProgress[AUDIO_INPUT]}
                fileName={uploadedFiles[AUDIO_INPUT]}
                onChange={(files) => handleFileChange(AUDIO_INPUT, files)}
            />
            <FileInput
                name="Ori Sub"
                ref={setInputRef(ORI_SUB_INPUT)}
                isDisabled={disabledStates[ORI_SUB_INPUT]}
                uploadProgress={uploadProgress[ORI_SUB_INPUT]}
                fileName={uploadedFiles[ORI_SUB_INPUT]}
                onChange={(files) => handleFileChange(ORI_SUB_INPUT, files)}
            />
            <FileInput
                name="Ref Sub"
                ref={setInputRef(REF_SUB_INPUT)}
                isMultiple
                isDisabled={disabledStates[REF_SUB_INPUT]}
                uploadProgress={uploadProgress[REF_SUB_INPUT]}
                fileName={uploadedFiles[REF_SUB_INPUT]}
                onChange={(files) => handleFileChange(REF_SUB_INPUT, files)}
            />
            <textarea name="" id=""></textarea>

            <div>
                <label htmlFor="retranscribe">retranscribe</label>
                <input type="checkbox" name="retranscribe" id="retranscribe" />
            </div>

            {/* TODO: client side storage check if input not all then cant click this
            input is all if server said so which is get session and saved to localstorage or something
            or after an upload if new session */}
            <button className="font-bold" disabled>
                Process sub
            </button>

            <p>Status</p>
            <p>...</p>
            <p>Get Sub</p>
            <p>...</p>
        </div>
    );
}
