import axios from "axios";
import FilesForm from "./main/FilesForm";
import { FormInitialValues } from "../_utils/types";

export default async function MainWindow({
    initialFiles,
}: {
    initialFiles?: FormInitialValues;
}) {
    return (
        <div>
            <FilesForm initialFiles={initialFiles} />
            <p>Status</p>
            <p>...</p>
            <p>Get Sub</p>
            <p>...</p>
        </div>
    );
}
