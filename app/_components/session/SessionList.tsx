"use client";

import { fetchData, getSessions } from "@/app/_utils/api";
import { paths } from "@/app/_utils/api-types";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

async function deleteSession(sessionId: string) {
    return await fetchData<
        paths["/sessions/{session_id}"]["delete"]["responses"]["200"]["content"]["application/json"]
    >(`/sessions/${sessionId}`, {
        method: "DELETE",
    });
}

export default function SessionList({ sessions }: { sessions: string[] }) {
    const [sessionList, setSessionList] = useState(sessions);
    const pathname = usePathname();
    const router = useRouter();

    const updateSessions = async () => {
        const sessionsRes = await getSessions();
        const sessions = sessionsRes.session_list;
        setSessionList(sessions);
    };

    const sessionElList = sessionList.map((session: string) => {
        return (
            <div key={session}>
                <Link href={session}>{session}</Link>
                <button
                    onClick={async () => {
                        await deleteSession(session);
                        updateSessions();
                        if (pathname.split("/")[1] === session) {
                            router.push("/");
                        }
                    }}
                >
                    🗑️
                </button>
            </div>
        );
    });

    useEffect(() => {
        updateSessions();
    }, [pathname]);

    return <div className="flex flex-col">{sessionElList}</div>;
}
