"use client"

import {useState, useEffect, FormEvent, ChangeEvent, Suspense} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {authFetch, baseURL} from "@/lib/api";
import { Check, Shield } from "lucide-react";
import Link from "next/link";

const VerifyTotpCode = () => {
    return (
        <Suspense>
            <Page />
        </Suspense>
    )
}

const Page = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const router = useRouter();

    const [code, setCode] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    // If no email is provided in the URL, we should show an error
    useEffect(() => {
        if (!email) {
            setError("Invalid verification link. Please try again with a valid verification link.");
        }
    }, [email]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Check for email
        if (!email) {
            setError("Invalid verification link. Please try again.");
            return;
        }

        // Basic validation for the code
        if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(baseURL() + "/user/verify-totp?code="+code, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "email": email
                })
            });

            if (!res.ok) {
                const err = await res.json();
                setError(err.message || "Failed to verify code");
                setIsLoading(false);
                return;
            }

            // update user account status
            const res2 = await authFetch("/user/activate-totp", {
                method: "PUT",
                body: JSON.stringify({
                    "email": email,
                    "activation_successful": isSuccess,
                })
            })

            if (!res2.ok) {
                const err = await res.json();
                setError(err.message || "Failed to verify code");
                setIsLoading(false);
                return;
            }

            setIsSuccess(true);

            // Redirect after successful verification (after showing success message briefly)
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);

        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-focus the input field when the component mounts
    useEffect(() => {
        const inputElement = document.getElementById('totp-code');
        if (inputElement) {
            inputElement.focus();
        }
    }, []);

    return (
        <div className="max-w-md mx-auto">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                {!isSuccess ? (
                    <>
                        <div className="text-center">
                            <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                            </div>
                            <h2 className="mt-6 text-3xl font-bold text-gray-800 dark:text-gray-100">Verify Your Code</h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Please enter the 6-digit code from your authenticator app
                                {email && <span className="block mt-1 font-medium">{email}</span>}
                            </p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="totp-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Verification Code
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        id="totp-code"
                                        name="code"
                                        type="text"
                                        autoComplete="one-time-code"
                                        required
                                        maxLength={6}
                                        className={`block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                                        placeholder="123456"
                                        value={code}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                            // Only allow digits
                                            const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                                            setCode(onlyNumbers);
                                        }}
                                    />
                                </div>
                                {error && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150`}
                                    disabled={isLoading || !email}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </span>
                                            Verifying...
                                        </>
                                    ) : (
                                        <>Verify Code</>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="text-center mt-4">
                            <Link href="/dashboard" className="text-sm font-medium hover:text-indigo-500 dark:text-indigo-400 hover:underline">
                                Back to Dashboard
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
                        </div>
                        <h2 className="mt-6 text-3xl font-bold text-gray-800 dark:text-gray-100">Verification Successful</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Your account has been verified successfully. Redirecting...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyTotpCode;