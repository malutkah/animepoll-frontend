"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

const SignupSuccessPage = () => {
    const router = useRouter()

    const handleDismiss = () => {
        router.push("/")
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded relative text-center">
                <p className="text-xl font-semibold mb-4">
                    Registration successful! You can now log in.
                </p>
                <div className="flex justify-center space-x-4">
                    <Link href="/login">
                        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                            Go to Login
                        </button>
                    </Link>
                    <button
                        onClick={handleDismiss}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SignupSuccessPage
