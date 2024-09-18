import { paths } from "./api-types";

const fetchData = async <T>(endpoint: string): Promise<T> => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`, {
            cache: "no-cache",
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json() as T;
    } catch (error) {
        console.error(`Error fetching ${endpoint}`, error);
        throw error;
    }
};

export const getSessions = async () => {
    return await fetchData<paths["/sessions"]["get"]["responses"]["200"]["content"]["application/json"]>('/sessions');
};

export const getProcessStatus = async (sessionId: string) => {
    return await fetchData<paths["/process-sub/{session_id}"]["get"]["responses"]["200"]["content"]["application/json"]>(`/process-sub/${sessionId}`);
};

export const getSub = async (sessionId: string) => {
    return await fetchData<paths["/sub/{session_id}"]["get"]["responses"]["200"]["content"]["application/json"]>(`/sub/${sessionId}`);
};
