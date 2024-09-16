import { paths } from "./api-types";

export type FormKeys = paths["/files/{session_id}/{file_type}"]["post"]['parameters']['path']['file_type'];

export type FormValues = {
    [K in FormKeys]: K extends "ref_sub_manual" ? string : FileList;
};

export type FormInitialValues = {
    [K in FormKeys]: string;
};

export type Transcription = paths["/sub/{session_id}"]["get"]["responses"]["200"]["content"]["application/json"]["transcription"];

export type ProcessStatus = paths["/process-sub/{session_id}"]["get"]["responses"]["200"]["content"]["application/json"]["status"];