import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainWindow from "./_components/MainWindow";
import SessionWindow from "./_components/SessionWindow";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "One Pace JP dev",
    description: "One Pace japanese subtitle maker",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="flex">
                    <SessionWindow />
                    {children}
                </div>
            </body>
        </html>
    );
}
