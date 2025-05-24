"use client"

import {Suspense} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import {baseURL} from "@/lib/api";

function ActivateAccount() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    )
}

function Page() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    //console.log(token)

    const router = useRouter()

    const handleDismiss = () => {
        router.push("/")
    }

    async function handleAccountActivation() {
        try {
            if (token && token != "") {
                const res = await fetch(baseURL() + "/user/activate-account?token="+token, {
                    method: "POST"
                })

                if (!res.ok) {
                    const err = await res.json();
                    console.error(err.message);
                    alert(err.message);
                    return;
                }

                if (res.status === 200) {
                    router.push("/login")
                }
            } else {
                alert("No token found!")
            }
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded relative text-center">
                <p className="text-xl font-semibold mb-4">
                    Activate your account
                </p>
                <div className="flex justify-center space-x-4">
                    <Link href="/login">
                        <button onClick={handleAccountActivation}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                        >
                            Activate
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

export default ActivateAccount;