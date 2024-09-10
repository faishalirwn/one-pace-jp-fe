"use client";

import axios from "axios";
import React, { forwardRef, useState } from "react";
import { useForm, UseFormRegister, SubmitHandler } from "react-hook-form";

async function uploadFile(
    files: File[] | string,
    fileType: string,
    sessionId: string,
    uploadProgressCb: (progress: number) => void
) {
    try {
        const data = new FormData();
        if (Array.isArray(files)) {
            files.forEach((file) => {
                data.append("files", file);
            });
        } else {
            data.append("sub", files);

            if (!files) {
                console.log("manual sub is empty");
                return;
            }
        }

        const res = await axios.post(
            `http://127.0.0.1:8000/files/${sessionId}/${fileType}`,
            data,
            {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.progress) {
                        const progress = parseFloat(
                            (progressEvent.progress * 100).toFixed(2)
                        );
                        uploadProgressCb(progress);
                    }
                },
            }
        );
        return res.data.filename;
    } catch (error) {
        return error;
    }
}

type FileInputProps = {
    label: string;
    uploadProgress?: number;
    fileName?: string;
    isMultiple?: boolean;
    accept: string;
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
        required,
        accept,
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
                onChange={onChange}
                multiple={isMultiple}
                required={required}
                accept={accept}
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

type FormKeys = "audio" | "original_sub" | "ref_sub" | "ref_sub_manual";

type FormValues = {
    [K in FormKeys]: K extends "ref_sub_manual" ? string : FileList;
};

export default function MainWindow() {
    const {
        register,
        handleSubmit,
        resetField,
        formState: { isSubmitting },
    } = useForm<FormValues>();

    const [uploadProgress, setUploadProgress] = useState<
        Partial<Record<FormKeys, number>>
    >({});

    const [uploadedFiles, setUploadedFiles] = useState<
        Partial<Record<FormKeys, string>>
    >({});

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        for (const property in data) {
            const key = property as keyof FormValues;
            let fileToUpload: File[] | string;

            if (data[key] instanceof FileList) {
                fileToUpload = Array.from(data[key]);
            } else {
                fileToUpload = data[key];
            }

            // TODO: temp
            const sessionId = "a424041a-c085-40a0-8b46-a41a2053afe5";

            const filename = await uploadFile(
                fileToUpload,
                property,
                sessionId,
                (progress) => {
                    setUploadProgress((prev) => ({
                        ...prev,
                        [property]: progress,
                    }));
                }
            );

            resetField(key);

            console.log(filename);

            setUploadedFiles((prev) => ({
                ...prev,
                [property]: filename,
            }));
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* TODO: upload success, filename returned, save it to local storage so when close tab or browser
                when return to session it's saved. some way to remember */}
                {/* TODO: if file already there aka remembering part seiko, 
                - adjust the button text, just like the button text instruct
                - can click if there are any changes on any field
                - textarea content uses the returned value from server, saved in local storage too */}
                <FileInput
                    label="Audio"
                    {...register("audio")}
                    disabled={isSubmitting}
                    uploadProgress={uploadProgress["audio"]}
                    fileName={uploadedFiles["audio"]}
                    required
                    accept="audio/*"
                />
                <FileInput
                    label="Ori Sub"
                    {...register("original_sub")}
                    disabled={isSubmitting}
                    uploadProgress={uploadProgress["original_sub"]}
                    fileName={uploadedFiles["original_sub"]}
                    required
                    accept=".srt,.ass"
                />
                <FileInput
                    label="Ref Sub"
                    {...register("ref_sub")}
                    isMultiple
                    disabled={isSubmitting}
                    uploadProgress={uploadProgress["ref_sub"]}
                    fileName={uploadedFiles["ref_sub"]}
                    required
                    accept=".srt,.ass"
                />
                <textarea
                    {...register("ref_sub_manual")}
                    disabled={isSubmitting}
                ></textarea>

                <div>
                    <label htmlFor="retranscribe">retranscribe</label>
                    <input type="checkbox" name="retranscribe" />
                </div>

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
