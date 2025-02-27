"use client"

import Link from "next/link"
import {FormEvent, useState} from "react"
import {useRouter} from "next/navigation"
import {Check, X, Eye} from "lucide-react";
import {baseURL} from "@/lib/api";

const SignupForm = () => {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [betaKey, setBetaKey] = useState('')

    // Combined error for server or overall errors
    const [error, setError] = useState('')

    // Field-specific error messages
    const [errorUsername, setErrorUsername] = useState('')
    const [errorEmail, setErrorEmail] = useState('')
    const [errorPassword, setErrorPassword] = useState('')
    const [errorPassword2, setErrorPassword2] = useState('')

    const passwordMatchColorYes = 'text-green-400'
    const passwordMatchColorNo = 'text-red-400'

    const [passwordCheckLength, setPasswordCheckLength] = useState(false)
    const [passwordCheckChars, setPasswordCheckChars] = useState(false)
    const [passwordCheckSpace, setPasswordCheckSpace] = useState(true)
    const [passwordCheckDigits, setPasswordCheckDigits] = useState(false)

    const [showPassword, setShowPassword] = useState(false)
    const [showPassword2, setShowPassword2] = useState(false)

    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()

    const isPasswordValid =
        passwordCheckLength &&
        passwordCheckChars &&
        passwordCheckSpace &&
        passwordCheckDigits

    const validatePassword = (pwd: string) => {
        setPasswordCheckLength(pwd.length >= 8)

        const hasUppercase = /[A-Z]/.test(pwd)
        const hasAllowed = /[a-z!?,.#&$'"@;*_]/.test(pwd)
        setPasswordCheckChars(hasUppercase && hasAllowed)
        setPasswordCheckSpace(!/\s/.test(pwd))
        setPasswordCheckDigits(/\d/.test(pwd))
    }

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
            const res = await fetch(baseURL()+"/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, username, password, "beta_key":betaKey}),
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

    const handleMouseDown = () => setShowPassword(true)
    const handleMouseUp = () => setShowPassword(false)
    const handleMouseDown2 = () => setShowPassword2(true)
    const handleMouseUp2 = () => setShowPassword2(false)

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
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errorEmail && <p className="mt-2 text-red-400 text-sm">{errorEmail}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => {
                                const newPwd = e.target.value
                                setPassword(newPwd)
                                validatePassword(newPwd)
                            }}
                            className="mt-1 block w-full pr-10 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            type="button"
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                            <Eye className="h-5 w-5"/>
                        </button>
                    </div>
                    {errorPassword && <p className="mt-2 text-red-400 text-sm">{errorPassword}</p>}
                </div>
                <div>
                    <label htmlFor="password2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword2 ? "text" : "password"}
                            id="password2"
                            name="password2"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            type="button"
                            onMouseDown={handleMouseDown2}
                            onMouseUp={handleMouseUp2}
                            onMouseLeave={handleMouseUp2}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                            <Eye className="h-5 w-5"/>
                        </button>
                    </div>
                    {errorPassword2 && <p className="mt-2 text-red-400 text-sm">{errorPassword2}</p>}


                    <p className={`mt-3 text-left ${passwordCheckLength ? passwordMatchColorYes : passwordMatchColorNo} text-sm flex items-center gap-1`}>
                        {passwordCheckLength ? <Check className="h-4 w-4"/> : <X className="h-4 w-4"/>}
                        <span>Password contains at least 8 characters</span>
                    </p>
                    <p className={`mt-1 text-left ${passwordCheckChars ? passwordMatchColorYes : passwordMatchColorNo} text-sm flex items-center gap-1`}>
                        {passwordCheckChars ? <Check className="h-4 w-4"/> : <X className="h-4 w-4"/>}
                        <span>Password contains letters (A-Z, a-z) and allowed characters (!?,.#&$'"@;*#_)</span>
                    </p>
                    <p className={`mt-1 text-left ${passwordCheckSpace ? passwordMatchColorYes : passwordMatchColorNo} text-sm flex items-center gap-1`}>
                        {passwordCheckSpace ? <Check className="h-4 w-4"/> : <X className="h-4 w-4"/>}
                        <span>Password does not contain spaces</span>
                    </p>
                    <p className={`mt-1 text-left ${passwordCheckDigits ? passwordMatchColorYes : passwordMatchColorNo} text-sm flex items-center gap-1`}>
                        {passwordCheckDigits ? <Check className="h-4 w-4"/> : <X className="h-4 w-4"/>}
                        <span>Password contains at least one digit (0-9)</span>
                    </p>

                </div>

                <div>
                    <label htmlFor="username"
                           className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enter your Beta Key
                    </label>
                    <input
                        type="password"
                        id="betakey"
                        name="betakey"
                        value={betaKey}
                        onChange={(e) => setBetaKey(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errorUsername && <p className="mt-2 text-red-400 text-sm">{errorUsername}</p>}
                </div>

                <div>
                    <label htmlFor={"accept-legal"} className={"flex text-sm font-medium text-gray-700 dark:text-gray-300"}>
                    <input
                        type={"checkbox"}
                        id={"accept-legal-checkbox"}
                        name={"accept-legal"}
                        className={"inline-block mr-4"}
                        required
                    />
                    <span>
                        By submitting this form, I agree to the
                        <Link href="/legal" target={"_blank"} className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                            privacy policy
                        </Link>
                    </span>

                    </label>
                </div>

                {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading || !isPasswordValid}
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
