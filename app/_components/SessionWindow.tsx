import Link from "next/link";
import SessionList from "./session/SessionList";
import { getSessions } from "../_utils/api";

async function createSession() {
    // const res = axios.post(`${process.env.BASE_URL}/session`)
}

export default async function SessionWindow() {
    const sessionsRes = await getSessions();
    const sessions = sessionsRes.session_list;

    return (
        <div>
            <Link href="/" className="p-1.5 bg-white text-black rounded">
                +
            </Link>
            <SessionList sessions={sessions} />
        </div>
    );
}
