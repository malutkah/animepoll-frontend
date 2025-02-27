import "./globals.css"
import { Inter, Montserrat } from "next/font/google"
import { ThemeProvider } from "next-themes"
import Navbar from "@/app/components/Navbar"
import { ToastProvider } from "@/app/components/ToastProvider"
import MaintenanceGate from "@/app/components/MaintenanceGate"
import Footer from "@/app/components/Footer";

const inter = Inter({ subsets: ["latin"] })
const mon = Montserrat({ weight: "400", subsets: ["latin"] })

export const metadata = {
    title: "AnimePoll",
    description: "Your Voice in the Anime Community",
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className={mon.className}>
        <ThemeProvider attribute="class">
            <ToastProvider>
                <MaintenanceGate>
                    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
                        <Navbar />
                        <main className="container mx-auto px-4 py-8 flex-1">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </MaintenanceGate>
            </ToastProvider>
        </ThemeProvider>
        </body>
        </html>
    )
}
