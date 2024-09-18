import { paths } from "./api-types";

type fetchDataOptions = {
    method?:RequestInit["method"], 
    body?: RequestInit["body"],
    headers?: RequestInit["headers"],
    useCache?: boolean,
}

export const fetchData = async <T>(endpoint: string, options:fetchDataOptions = {
    method: "GET",
    useCache: false
}): Promise<T> => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`, {
            cache: options.useCache ?  undefined: "no-cache",
            method: options.method,
            body: options.body,
            headers: options.headers,
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
