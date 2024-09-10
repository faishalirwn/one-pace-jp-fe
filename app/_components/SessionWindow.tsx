import axios, { AxiosResponse } from "axios";

async function getSessions() {
    const res = await axios.get(`http://127.0.0.1:8000/sessions`);
    return res.data.session_list;
}

async function createSession() {
    // const res = axios.post(`http://127.0.0.1:8000/session`)
}

export default async function SessionWindow() {
    const sessions = await getSessions();

    const sessionElList = sessions.map((session: string) => {
        return <div key={session}>{session}</div>;
    });

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
            {/* <button onClick={createSession}>+</button> */}
            <div>{sessionElList}</div>
        </div>
    );
}
