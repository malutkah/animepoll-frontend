// app/layout.tsx
import {Inter, Montserrat} from "next/font/google";
import {ThemeProvider} from "next-themes";
import Navbar from "@/app/components/Navbar";
import {ToastProvider} from "@/app/components/ToastProvider";
import {MessageProvider} from "@/app/components/MessageBoxExport";
import MaintenanceGate from "@/app/components/MaintenanceGate";
import Footer from "@/app/components/Footer";
import ClientWrapper from "@/app/components/ClientWrapper";
import "./globals.css";
import {AuthProvider} from "@/lib/AuthContext";

const mon = Montserrat({weight: "400", subsets: ["latin"]});

export const metadata = {
    title: "AnimePoll",
    description: "Your Voice in the Anime Community",
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body className={mon.className}>
        <ThemeProvider attribute="class">
            <MessageProvider>
                <ToastProvider>
                    <AuthProvider>
                        <ClientWrapper>
                            <MaintenanceGate>
                                <div
                                    className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
                                    <Navbar/>
                                    <main className="container mx-auto px-4 py-8 flex-1">
                                        {children}
                                    </main>
                                    <Footer/>
                                </div>
                            </MaintenanceGate>
                        </ClientWrapper>
                    </AuthProvider>
                </ToastProvider>
            </MessageProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}