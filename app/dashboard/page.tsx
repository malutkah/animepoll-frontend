"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ProtectedRoute from "../components/ProtectedRoute"
import { authFetch } from "../../lib/api"
import { useRouter } from "next/navigation"

interface Survey {
    id: string;
    title: string;
    description: string;
    visibility: string;
}

const DashboardPage = () => {
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    const fetchSurveys = async () => {
        try {
            const res = await authFetch("http://localhost:8080/poll/survey/all")
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to load surveys")
                return
            }
            const data = await res.json()
            setSurveys(data)
        } catch (err: any) {
            setError("Failed to load surveys")
        }
    }

    useEffect(() => {
        fetchSurveys()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this survey?")) return
        try {
            const res = await authFetch(`http://localhost:8080/poll/survey/${id}`, {
                method: "DELETE"
            })
            if (!res.ok) {
                const err = await res.json()
                alert(err.message || "Failed to delete survey")
            } else {
                alert("Survey deleted")
                fetchSurveys()
            }
        } catch (err) {
            alert("Failed to delete survey")
        }
    }

    // Filter surveys based on search term
    const filteredSurveys = surveys && surveys.filter(survey =>
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description.toLowerCase().includes(searchTerm.toLowerCase())

    )

    return (
        <ProtectedRoute>
            <div>
                <h1 className="text-4xl font-bold mb-6 text-gray-800">Dashboard</h1>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search surveys..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="mb-6">
                    <Link
                        href="/dashboard/create"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Create New Survey
                    </Link>
                </div>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!filteredSurveys || filteredSurveys.length === 0 ? (
                        <p>No surveys found.</p>
                    ) : (
                        filteredSurveys && filteredSurveys.map((survey) => (
                            <div key={survey.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 break-all">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-wrap">{survey.title}</h2>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">{survey.description}</p>
                                <div className="mt-4 flex space-x-2">
                                    <Link
                                        href={`/dashboard/${survey.id}`}
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 rounded"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        href={`/dashboard/${survey.id}/edit`}
                                        className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-1 px-3 rounded"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(survey.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}

export default DashboardPage
