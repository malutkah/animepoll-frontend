"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

const SignupForm = () => {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')

    // Combined error for server or overall errors
    const [error, setError] = useState('')

    // Field-specific error messages
    const [errorUsername, setErrorUsername] = useState('')
    const [errorEmail, setErrorEmail] = useState('')
    const [errorPassword, setErrorPassword] = useState('')
    const [errorPassword2, setErrorPassword2] = useState('')

    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()

    const signupFormSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")

        let valid = true

        // Validate username
        if (!username) {
            setErrorUsername("Please enter a username")
            valid = false
        } else {
            setErrorUsername("")
        }

        // Validate email
        if (!email) {
            setErrorEmail("Please enter an email")
            valid = false
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrorEmail("Invalid email format")
            valid = false
        } else {
            setErrorEmail("")
        }

        // Validate password
        if (!password) {
            setErrorPassword("Please enter a password")
            valid = false
        } else {
            setErrorPassword("")
        }

        // Validate confirm password
        if (!password2) {
            setErrorPassword2("Please confirm your password")
            valid = false
        } else if (password !== password2) {
            setErrorPassword2("Passwords do not match")
            valid = false
        } else {
            setErrorPassword2("")
        }

        if (!valid) return

        setIsLoading(true)

        try {
            const res = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, username, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || "Something went wrong.")
                return
            }

            // On successful registration, redirect to the success page.
            router.push("/signup/success")
        } catch (err: any) {
            setError("Something went wrong. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Sign Up</h2>
            <form className="space-y-4" onSubmit={signupFormSubmit}>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errorUsername && <p className="mt-2 text-red-400 text-sm">{errorUsername}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errorEmail && <p className="mt-2 text-red-400 text-sm">{errorEmail}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errorPassword && <p className="mt-2 text-red-400 text-sm">{errorPassword}</p>}
                </div>
                <div>
                    <label htmlFor="password2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="password2"
                        name="password2"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errorPassword2 && <p className="mt-2 text-red-400 text-sm">{errorPassword2}</p>}
                </div>
                {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50"
                >
                    {isLoading ? "Signing Up..." : "Sign Up"}
                </button>
            </form>
            <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Login
                </Link>
            </p>
        </div>
    )
}

export default SignupForm
