"use client";

import { paths } from "@/app/_utils/api-types";
import { FormInitialValues, FormKeys, FormValues } from "@/app/_utils/types";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { forwardRef, useState } from "react";
import { useForm, UseFormRegister, SubmitHandler } from "react-hook-form";

async function uploadFile(
    payload: File[] | string,
    fileType: string,
    sessionId: string,
    uploadProgressCb: (progress: number) => void
) {
    try {
        const data = new FormData();
        if (Array.isArray(payload)) {
            payload.forEach((file) => {
                data.append("files", file);
            });
        } else {
            data.append("sub", payload);

            if (!payload) {
                console.log("manual sub is empty");
                return;
            }
        }

        const res = await axios.post<
            paths["/files/{session_id}/{file_type}"]["post"]["responses"]["200"]["content"]["application/json"]
        >(
            `${process.env.NEXT_PUBLIC_BASE_URL}/files/${sessionId}/${fileType}`,
            data,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
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
        console.error("Upload error:", error);
        throw error;
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

export default function FilesForm({
    initialFiles,
}: {
    initialFiles?: FormInitialValues;
}) {
    const pathname = usePathname();
    const router = useRouter();

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
    >({
        audio: initialFiles?.audio,
        original_sub: initialFiles?.original_sub,
        ref_sub: initialFiles?.ref_sub,
        ref_sub_manual: initialFiles?.ref_sub_manual,
    });
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            let sessionId = pathname.split("/")[1];
            if (pathname === "/") {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/session`,
                    {
                        method: "post",
                    }
                );
                const data: paths["/session"]["post"]["responses"]["200"]["content"]["application/json"] =
                    await res.json();
                sessionId = data.session_id;
            }
            for (const property in data) {
                const key = property as keyof FormValues;
                let fileToUpload: File[] | string;

                if (data[key] instanceof FileList) {
                    fileToUpload = Array.from(data[key]);
                } else {
                    fileToUpload = data[key];
                }

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

                if (key !== "ref_sub_manual") {
                    resetField(key);
                }

                setUploadedFiles((prev) => ({
                    ...prev,
                    [property]: filename,
                }));
            }
            await axios.post<
                paths["/process-sub/{session_id}"]["post"]["responses"]["200"]["content"]["application/json"]
            >(`${process.env.NEXT_PUBLIC_BASE_URL}/process-sub/${sessionId}`);
            router.push(`/${sessionId}`);
        } catch (error) {
            console.log("submit error", error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* TODO: - adjust the button text, just like the button text instruct
                - can click if there are any changes on any field */}
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
                className="bg-black border-white border rounded"
                {...register("ref_sub_manual")}
                defaultValue={uploadedFiles.ref_sub_manual}
                disabled={isSubmitting}
            ></textarea>

            <div>
                <label htmlFor="retranscribe">retranscribe</label>
                <input type="checkbox" name="retranscribe" />
            </div>

            <button type="submit" className="font-bold">
                Upload & Process sub if file input not none Process sub if file
                input none
            </button>
        </form>
    );
}
