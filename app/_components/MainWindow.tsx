"use client";

import React, { useState } from "react";

async function fetchShit(files: File[]) {
    try {
        const data = new FormData();
        files.forEach((file) => {
            data.append("files", file);
        });
        const res = await fetch("http://127.0.0.1:8000/test", {
            method: "POST",
            body: data,
        });
        console.log(res);
        // from server standard way to say it succeed or failed, temporary true false
        return true;
    } catch (error) {
        return false;
    }
}

function FileInput({
    name,
    isMultiple = false,
    onChange,
}: {
    name: string;
    isMultiple?: boolean;
    onChange: (files: FileList) => void;
}) {
    return (
        <div>
            <p>{name}</p>
            <input
                type="file"
                name={name}
                id={name}
                onChange={(e) => {
                    if (e.target.files) {
                        onChange(e.target.files);
                    }
                }}
                multiple={isMultiple}
            />
        </div>
    );
}

export default function MainWindow() {
    const handleFileChange = async (files: FileList) => {
        const res = await fetchShit(Array.from(files));
    };

    return (
        <div>
            <FileInput name="shit" isMultiple onChange={handleFileChange} />
            {/* <button>Process Sub</button>
            <p>Status</p>
            <p>...</p>
            <p>Get Sub</p>
            <p>...</p> */}
        </div>
    );
}
