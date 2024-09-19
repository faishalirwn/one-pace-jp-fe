import Link from "next/link";
import SessionList from "./session/SessionList";
import { getSessions } from "../_utils/api";

export default async function SessionWindow() {
    const sessionsRes = await getSessions();
    const sessions = sessionsRes.session_list;

    return (
        <div className="p-2">
            <Link href="/" className="p-1.5 bg-white text-black rounded">
                +
            </Link>
            <div className="mt-5">
                <SessionList sessions={sessions} />
            </div>
        </div>
    );
}
