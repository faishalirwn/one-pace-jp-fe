import Link from "next/link";
import SessionList from "./session/SessionList";
import { getSessions } from "../_utils/api";

async function createSession() {
    // const res = axios.post(`${process.env.BASE_URL}/session`)
}

export default async function SessionWindow() {
    const sessions: string[] = await getSessions();

    return (
        <div>
            {/* TODO: [] add session */}
            {/* TODO: [] delete session */}
            {/* FEAT: edit session no. session name ga jadi. use audio filename truncated */}
            {/* FEAT: session saved when process button is clicked. new button just reset main window state
            - process click. req session. mainwindow remember. sessionwindow req session list, url change to session, sessionwindow highlight current session
            once mainwindow remember all just flow.
            - on refresh get session from url. sessionwindow onclick change the url. */}
            {/* Q: best use client usage why this why that */}
            {/* Q: best way to type response, wouldn't be too tedious to type everything, can we
            utilize swagger ui openapi docs */}
            <Link href="/" className="p-1.5 bg-white text-black rounded">
                +
            </Link>
            <SessionList sessions={sessions} />
        </div>
    );
}
