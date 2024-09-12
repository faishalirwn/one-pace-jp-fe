import MainWindow from "../_components/MainWindow";

export default function SessionPage({
    params,
}: {
    params: {
        sessionId: string;
    };
}) {
    return <MainWindow sessionId={params.sessionId} />;
}
