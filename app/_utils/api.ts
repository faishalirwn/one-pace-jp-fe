import axios from "axios";
import { paths } from "./api-types";

export const getSessions = async function() {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/sessions`);
    return res.data.session_list;
}

export const getProcessStatus = async function(sessionId: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/process-sub/${sessionId}`
        );
        const data: paths["/process-sub/{session_id}"]["get"]["responses"]["200"]["content"]["application/json"] =
            await res.json();
        return data.status;
    } catch (error) {
        console.error("Get process status error", error);
        throw error;
    }
}


export const getSub = async function(sessionId: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/sub/${sessionId}`
        );
        const data: paths["/sub/{session_id}"]["get"]["responses"]["200"]["content"]["application/json"] =
            await res.json();
        return data.transcription;
    } catch (error) {
        console.error("Get sub", error);
        throw error;
    }
}