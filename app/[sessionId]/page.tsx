import axios from "axios";
import MainWindow from "../_components/MainWindow";
import { notFound } from "next/navigation";
import { paths } from "../_utils/api-types";
import { FormInitialValues } from "../_utils/types";

async function getFiles(sessionId: string) {
    const res = await axios.get<
        paths["/files/{session_id}"]["get"]["responses"]["200"]["content"]["application/json"]
    >(`${process.env.NEXT_PUBLIC_BASE_URL}/files/${sessionId}`);
    return res.data.files as FormInitialValues;
}

async function getSub(sessionId: string) {
    const res = await axios.get<
        paths["/sub/{session_id}"]["get"]["responses"]["200"]["content"]["application/json"]
    >(`${process.env.NEXT_PUBLIC_BASE_URL}/sub/${sessionId}`);
    return res.data.transcription;
}

async function getSessionExist(sessionId: string) {
    try {
        const res = await axios.get<
            paths["/sessions/{session_id}"]["get"]["responses"]["200"]["content"]["application/json"]
        >(`${process.env.NEXT_PUBLIC_BASE_URL}/sessions/${sessionId}`);
        return res.data.session_id === sessionId;
    } catch (error) {
        console.error("Session exist error:", error);
        return error;
    }
}

export default async function SessionPage({
    params,
}: {
    params: {
        sessionId: string;
    };
}) {
    const sessionId = params.sessionId;
    const isSessionExist = await getSessionExist(sessionId);

    if (!isSessionExist) {
        notFound();
    }

    const initialFiles = await getFiles(sessionId);
    const sub = await getSub(sessionId);

    return (
        <>
            <MainWindow sessionId={sessionId} initialFiles={initialFiles} />
        </>
    );
}
