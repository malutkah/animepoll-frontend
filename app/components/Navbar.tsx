"use client"

import Link from "next/link"
import React, { useEffect, useState } from "react"
import {usePathname, useRouter} from "next/navigation"
import LanguageSwitcher from './LanguageSwitcher';
import useTranslation from '@/lib/useTranslation'
import { Home, Search, User, LogOut, LogIn, UserPlus } from "lucide-react"

const Navbar = () => {
    const [loggedIn, setLoggedIn] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const { t } = useTranslation();
    const router = useRouter()
    const pathname = usePathname()
    const logo = "/logo_120_transparent.png"

    // Check auth status on mount and whenever the pathname changes
    useEffect(() => {
        const token = localStorage.getItem("token")
        setLoggedIn(!!token)
    }, [pathname])

    // Listen to storage events for cross-tab changes
    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem("token")
            setLoggedIn(!!token)
        }
        window.addEventListener("storage", handleStorageChange)
        return () => window.removeEventListener("storage", handleStorageChange)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("expires_at")
        router.push("/")
        setLoggedIn(false)
    }

    return (
        <nav className="p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md relative">
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                <div className="w-12 h-12 overflow-hidden mb-0">
                    <img src={logo} alt="Anime Poll logo" className="w-full h-full object-cover"/>
                </div>
                <span>AnimePoll</span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
                {loggedIn ? (
                    <>
                        <Link
                            href="/discover"
                            className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-500"
                        >
                            <Search className="h-5 w-5" />
                            <span>Discover Polls</span>
                        </Link>
                        <Link
                            href="/dashboard"
                            className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 dark:hover:text-sky-500"
                        >
                            <Home className="h-5 w-5" />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            href="/profile"
                            className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 dark:hover:text-emerald-400"
                        >
                            <User className="h-5 w-5" />
                            <span>Profile</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1 text-red-400 "
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            <LogIn className="h-5 w-5" />
                            <span>Login</span>
                        </Link>
                        <Link
                            href="/signup"
                            className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            <UserPlus className="h-5 w-5" />
                            <span>Sign Up</span>
                        </Link>
                    </>
                )}
                <LanguageSwitcher />
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
                                    className="flex items-center space-x-1 block mb-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <Home className="h-5 w-5" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    href="/discover"
                                    className="flex items-center space-x-1 block mb-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <Search className="h-5 w-5" />
                                    <span>Discover Polls</span>
                                </Link>
                                <Link
                                    href="/profile"
                                    className="flex items-center space-x-1 block mb-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <User className="h-5 w-5" />
                                    <span>Profile</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout()
                                        setMenuOpen(false)
                                    }}
                                    className="flex items-center space-x-1 dark:text-gray-300 text-red-600"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center space-x-1 block mb-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <LogIn className="h-5 w-5" />
                                    <span>Login</span>
                                </Link>
                                <Link
                                    href="/signup"
                                    className="flex items-center space-x-1 block text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <UserPlus className="h-5 w-5" />
                                    <span>Sign Up</span>
                                </Link>
                            </>
                        )}
                        <LanguageSwitcher />
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
