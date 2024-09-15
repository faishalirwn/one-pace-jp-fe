import { paths } from "@/app/_utils/api-types";
import axios from "axios";

async function getProcessStatus(sessionId: string) {
    try {
        const res = await axios.get<
            paths["/process-sub/{session_id}"]["get"]["responses"]["200"]["content"]["application/json"]
        >(`${process.env.NEXT_PUBLIC_BASE_URL}/process-sub/${sessionId}`);
        return res.data.status;
    } catch (error) {
        console.log("Get process status error", error);
        return "";
    }
}

export default function SubTable({
    sessionId,
    isProcessClicked,
}: {
    sessionId: string;
    isProcessClicked: boolean;
}) {
    const processStatus = getProcessStatus(sessionId);
    console.log("asdasdas", processStatus);
    return (
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colSpan={6}>{processStatus}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    );
}
