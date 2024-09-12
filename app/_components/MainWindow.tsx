import axios from "axios";
import FilesForm from "./main/FilesForm";

async function getFiles(sessionId: string) {
    const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/files/${sessionId}`
    );
    return res.data.files;
}

export default async function MainWindow({
    sessionId,
}: {
    sessionId?: string;
}) {
    return (
        <div>
            <FilesForm />
            <p>Status</p>
            <p>...</p>
            <p>Get Sub</p>
            <p>...</p>
        </div>
    );
}
