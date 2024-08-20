import MainWindow from "./_components/MainWindow";
import SessioWindow from "./_components/SessionWindow";

export default function Home() {
    return (
        <div className="flex">
            <SessioWindow />
            <MainWindow />
        </div>
    );
}
