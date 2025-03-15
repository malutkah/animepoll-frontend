"use client"
import {useEffect, useState} from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';
import {usePathname, useSearchParams} from "next/navigation";
import {authFetch, baseURL} from "@/lib/api";

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [loggedIn, setLoggedIn] = useState(false)
    const pathname = usePathname()

    const fetchProfile = async () => {
        try {
            const res = await authFetch("/user/me")
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to load profile")
                return
            }
            const data = await res.json()

            setEmail(data.email)
        } catch (err) {
            setError("Failed to load profile")
        }
    }

    useEffect(() => {
        if (loggedIn) {
            fetchProfile()
        }
    }, [loggedIn]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Simple email validation
        if (!email.includes('@') || !email.includes('.')) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(baseURL() + "/user/send/password-reset-mail", {
                method: "POST",
                body: JSON.stringify({"email": email})
            })

            if (!res.ok) {
                const err = await res.json();
                setError(err.message);
                setIsLoading(false);
                return;
            }

        } catch (err) {
            console.error(err)
            setError(err)
        } finally {
            setIsLoading(false);
            setIsSubmitted(true);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token")
        setLoggedIn(!!token)
    }, [pathname])

    return (
        <div className="max-w-md mx-auto">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                {!isSubmitted ? (
                    <>
                        <div className="text-center">
                            <div
                                className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-300"/>
                            </div>
                            <h2 className="mt-6 text-3xl font-bold text-gray-800 dark:text-gray-100">Reset Your
                                Password</h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Enter your email address below and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email address
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        readOnly={loggedIn}
                                        className={`block w-full px-3 py-2 border ${error ? 'border-red-300 text-red-900' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                {error && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                                <svg className="animate-spin h-5 w-5 text-white"
                                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                                            stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor"
                                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Reset Password
                                            <ArrowRight className="ml-2 h-4 w-4"/>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {loggedIn ? (
                            <div className="text-center mt-4">
                                <a href="/profile"
                                   className="text-sm font-medium hover:text-blue-500 dark:text-indigo-400 hover:underline">
                                    Back to Profile
                                </a>
                            </div>
                        ): (
                            <div className="text-center mt-4">
                                <a href="/login"
                                   className="text-sm font-medium hover:text-blue-500 dark:text-indigo-400 hover:underline">
                                    Back to login
                                </a>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center">
                        <div
                            className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Check className="h-6 w-6 text-green-600 dark:text-green-300"/>
                        </div>
                        <h2 className="mt-6 text-3xl font-bold text-gray-800 dark:text-gray-100">Check Your Email</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            We've sent a password reset link to <span className="font-medium">{email}</span>. Please
                            check your inbox and follow the instructions.
                        </p>
                        <div className="mt-6">
                            <button
                                type="button"
                                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Try another email
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordReset;