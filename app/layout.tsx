import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import Navbar from "@/app/components/Navbar"
import { ToastProvider } from "@/app/components/ToastProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AnimePoll",
  description: "Your Voice in the Anime Community",
}

export default function RootLayout({ children }) {
  return (
      <html lang="en">
      <body className={inter.className}>
      <ThemeProvider attribute="class">
        <ToastProvider>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <Navbar />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </div>
        </ToastProvider>
      </ThemeProvider>
      </body>
      </html>
  )
}
