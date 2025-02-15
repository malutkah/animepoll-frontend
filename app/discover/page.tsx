"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Survey {
    id: string;
    title: string;
    description: string;
}

const DiscoverPage = () => {
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [error, setError] = useState("")

    const fetchPublicSurveys = async () => {
        try {
            const res = await fetch("http://localhost:8080/poll/survey/all/public")
            if (!res.ok) {
                const err = await res.json()
                setError(err.message|| err.error || "Failed to load public surveys")
                return
            }
            const data = await res.json()
            setSurveys(data)
        } catch (err) {
            setError("Failed to load public surveys")
        }
    }

    useEffect(() => {
        fetchPublicSurveys()
    }, [])

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-gray-800">Discover Polls</h1>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {surveys.length === 0 ? (
                    <p>No public surveys found.</p>
                ) : (
                    surveys.map((survey) => (
                        <div key={survey.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{survey.title}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">{survey.description}</p>
                            <div className="mt-4">
                                <Link
                                    href={`/discover/${survey.id}`}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded"
                                >
                                    View Survey
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default DiscoverPage;
