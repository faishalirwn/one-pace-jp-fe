"use client";

import axios from "axios";
import React, { forwardRef, useRef, useState } from "react";
import { useForm, UseFormRegister, SubmitHandler } from "react-hook-form";

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
    label: string;
    uploadProgress?: number;
    fileName?: string;
    isMultiple?: boolean;
};

const FileInput = forwardRef<
    HTMLInputElement,
    FileInputProps & ReturnType<UseFormRegister<FormValues>>
>(function FileInput(
    {
        name,
        label,
        uploadProgress = 0,
        fileName = undefined,
        isMultiple = false,
        disabled,
        onChange,
    },
    ref
) {
    return (
        <div>
            <label htmlFor={name}>{label}</label>
            <input
                ref={ref}
                type="file"
                name={name}
                disabled={disabled}
                // onChange={(e) => {
                //     if (
                //         onChange &&
                //         e.target.files &&
                //         e.target.files.length !== 0
                //     ) {
                //         onChange(e.target.files);
                //     }
                // }}
                onChange={onChange}
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
});

interface FormValues {
    audio: File;
    oriSub: File;
    refSub: File[];
    refSubManual: number;
}

export default function MainWindow() {
    const { register, handleSubmit } = useForm<FormValues>();

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

    const setInputRef = (inputName: string) => {
        return (element: HTMLInputElement | null) => {
            inputsRef.current[inputName] = element;
        };
    };

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log(data);
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FileInput
                    // name="audio"
                    label="Audio"
                    {...register("audio")}
                    // ref={setInputRef(AUDIO_INPUT)}
                    // isDisabled={disabledStates[AUDIO_INPUT]}
                    // uploadProgress={uploadProgress[AUDIO_INPUT]}
                    // fileName={uploadedFiles[AUDIO_INPUT]}
                    // onChange={(files) => handleFileChange(AUDIO_INPUT, files)}
                />
                {/* <FileInput
                    name="ori_sub"
                    label="Ori Sub"
                    ref={setInputRef(ORI_SUB_INPUT)}
                    isDisabled={disabledStates[ORI_SUB_INPUT]}
                    uploadProgress={uploadProgress[ORI_SUB_INPUT]}
                    fileName={uploadedFiles[ORI_SUB_INPUT]}
                    // onChange={(files) => handleFileChange(ORI_SUB_INPUT, files)}
                />
                <FileInput
                    name="ref_sub"
                    label="Ref Sub"
                    ref={setInputRef(REF_SUB_INPUT)}
                    isMultiple
                    isDisabled={disabledStates[REF_SUB_INPUT]}
                    uploadProgress={uploadProgress[REF_SUB_INPUT]}
                    fileName={uploadedFiles[REF_SUB_INPUT]}
                    // onChange={(files) => handleFileChange(REF_SUB_INPUT, files)}
                /> */}
                <textarea name="ref_sub_manual"></textarea>

                <div>
                    <label htmlFor="retranscribe">retranscribe</label>
                    <input type="checkbox" name="retranscribe" />
                </div>

                {/* TODO: client side storage check if input not all then cant click this
            input is all if server said so which is get session and saved to localstorage or something
            or after an upload if new session */}
                <button type="submit" className="font-bold">
                    Upload & Process sub if file input not none Process sub if
                    file input none
                </button>
            </form>

            <p>Status</p>
            <p>...</p>
            <p>Get Sub</p>
            <p>...</p>
        </div>
    );
}
