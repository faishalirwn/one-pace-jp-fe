import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SessionWindow from "./_components/SessionWindow";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "One Pace JP",
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
                    <div className="w-[10%]">
                        <SessionWindow />
                    </div>
                    <div className="w-[89%]">{children}</div>
                </div>
            </body>
        </html>
    );
}
