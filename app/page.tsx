import MainWindow from "./_components/MainWindow";
import SessionWindow from "./_components/SessionWindow";

export default function Home() {
    return (
        <div className="flex">
            <SessionWindow />
            <MainWindow />
        </div>
    );
}
