"use client";

import { getSessions } from "@/app/_lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function SessionList({ sessions }: { sessions: string[] }) {
    const [sessionList, setSessionList] = useState(sessions);
    const pathname = usePathname();

    const sessionElList = sessionList.map((session: string) => {
        return (
            <Link key={session} href={session}>
                {session}
            </Link>
        );
    });

    useEffect(() => {
        getSessions().then((sessions) => {
            setSessionList(sessions);
        });
    }, [pathname]);

    return <div className="flex flex-col">{sessionElList}</div>;
}
