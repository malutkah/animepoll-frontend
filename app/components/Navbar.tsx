"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ThemeToggle from "./ThemeToggle"

const Navbar = () => {
    const [loggedIn, setLoggedIn] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token")
            setLoggedIn(!!token)
        }
    }, [])

    const handleLogout = () => {
        // Clear token and related data then redirect to landing page
        localStorage.removeItem("token")
        localStorage.removeItem("expires_at")
        router.push("/")
    }

    return (
        <nav className="p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md relative">
            <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                AnimePoll
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
                {loggedIn ? (
                    <>
                        <Link
                            href="/dashboard"
                            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/profile"
                            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            Login
                        </Link>
                        <Link
                            href="/signup"
                            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            Sign Up
                        </Link>
                    </>
                )}
                {/* Optional: Uncomment to include theme toggle */}
                {/* <ThemeToggle /> */}
            </div>
            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
                <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
                    <svg
                        className="w-6 h-6 text-gray-600 dark:text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {menuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
                {menuOpen && (
                    <div className="absolute top-16 right-4 bg-white dark:bg-gray-800 shadow-md rounded p-4 z-10">
                        {loggedIn ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="block mb-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/profile"
                                    className="block mb-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout()
                                        setMenuOpen(false)
                                    }}
                                    className="block text-gray-600 dark:text-gray-300 hover:text-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="block mb-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
