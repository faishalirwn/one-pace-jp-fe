"use client";

import { paths } from "@/app/_utils/api-types";
import axios from "axios";

async function getProcessStatus(sessionId: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/process-sub/${sessionId}`
        );
        const data: paths["/process-sub/{session_id}"]["get"]["responses"]["200"]["content"]["application/json"] =
            await res.json();
        return data.status;
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
    let processStatus = "";
    if (isProcessClicked) {
        getProcessStatus(sessionId).then((status) => {
            processStatus = status;
        });
    }
    return (
        <>
            {isProcessClicked && <p>waw{processStatus}</p>}

            <p>{`clicked = ${isProcessClicked}`}</p>
            <table>
                <thead>
                    <tr>
                        <th>start time</th>
                        <th>end time</th>
                        <th>ori text</th>
                        <th>transcrisption</th>
                        <th>match</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}
