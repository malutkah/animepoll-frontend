"use client"

import {useEffect, useState} from "react"
import Link from "next/link"
import ProtectedRoute from "@/app/components/ProtectedRoute"
import {authFetch, baseURL} from "@/lib/api"
import { useMessage } from "@/app/components/MessageBoxExport";

interface Survey {
    id: string;
    title: string;
    description: string;
    visibility: string;
    genre_id: string;
}

interface AnimeGenre {
    id: string;
    name: string;
}

const DashboardPage = () => {
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const { showMessage } = useMessage();

    const [genres, setGenres] = useState<AnimeGenre[]>([])

    const fetchSurveys = async () => {
        try {
            const res = await authFetch("/poll/survey/all")
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

    const fetchAnimeGenres = async () => {
        try {
            const res = await fetch(baseURL()+"/poll/survey/genres")
            if (res.status !== 200) {
                const err = await res.json();
                setError(err.message || "Failed to load genres");
                return;
            }
            const data = await res.json()
            setGenres(data);

        } catch (err) {
            setError("Failed getting genres");
            console.log(err)
        } finally {
        }
    }

    useEffect(() => {
        fetchSurveys()
        fetchAnimeGenres()
    }, [])

    const getGenreName = (genreId: string) => {
        if (surveys && surveys.length) {
            const genre = genres.find((g: AnimeGenre) => g.id === genreId)
            if (genre) {
                return genre.name
            } else {
                return "No genre";
            }
        }
    }

    // const handleDelete = async (id: string) => {
    //     if (!confirm("Are you sure you want to delete this survey?")) return
    //     try {
    //         const res = await authFetch(`/poll/survey/${id}`, {
    //             method: "DELETE"
    //         })
    //         if (!res.ok) {
    //             const err = await res.json()
    //             alert(err.message || "Failed to delete survey")
    //         } else {
    //             alert("Survey deleted")
    //             fetchSurveys()
    //         }
    //     } catch (err) {
    //         alert("Failed to delete survey")
    //     }
    // }

    const handleDelete = async (id: string) => {
        const msgId = showMessage({
            type: "question",
            title: "Delete Survey",
            message: "Are you sure you want to delete this survey? This action cannot be undone.",
            onConfirm: async () => {
                try {
                    const res = await authFetch(`/poll/survey/${id}`, {
                        method: "DELETE"
                    })
                    if (!res.ok) {
                        const err = await res.json()
                        showMessage({
                            type: 'error',
                            title: 'Deletion Failed',
                            message: err.message || "Failed to delete question",
                            showIcon: true,
                            autoClose: true
                        });
                    } else {
                        showMessage({
                            type: 'success',
                            title: 'Question Deleted',
                            message: 'Question was successfully deleted',
                            showIcon: true,
                            autoClose: true
                        });
                        fetchSurveys()
                    }
                } catch (err) {
                    showMessage({
                        type: 'error',
                        title: 'Deletion Failed',
                        message: "An unexpected error occurred. Please try again.",
                        showIcon: true,
                        autoClose: true
                    });
                }
            },
            onCancel: () => {},
            confirmText: "Delete",
            cancelText: "Cancel",
            showIcon: true,
            showCloseButton: false,
        })
    }

    // Filter surveys based on search term
    const filteredSurveys = surveys && surveys.filter(survey =>
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <ProtectedRoute>
            <div>
                <h1 className="text-4xl font-bold mb-6 text-white">Dashboard</h1>
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
                            <div key={survey.id}
                                 className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 break-all hover:scale-105 transition-transform duration-200">
                                <div className={"flex justify-end"}>
                                    <p className={"pt-0 text-indigo-400 text-sm"}>{getGenreName(survey.genre_id)}</p>
                                </div>
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
