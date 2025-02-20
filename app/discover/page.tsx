"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { authFetch } from "@/lib/api"

interface Survey {
    id: string;
    title: string;
    description: string;
    genre_id: string;
}

interface AnimeGenre {
    id: string;
    name: string;
}

type AnimeGenres = AnimeGenre[];

const DiscoverPage = () => {
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [error, setError] = useState("")
    const [genres, setGenres] = useState<AnimeGenre[] | []>([])

    const fetchPublicSurveys = async () => {
        try {
            const res = await fetch("http://localhost:8080/poll/survey/all/public")
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || err.error || "Failed to load public surveys")
                return
            }
            const data = await res.json()
            setSurveys(data)
        } catch (err) {
            setError("Failed to load public surveys")
        }
    }

    const fetchAnimeGenres = async () => {
        try {
            const res = await authFetch("http://localhost:8080/poll/survey/genres")
            if (res.status !== 200) {
                const err = await res.json();
                setError(err.message || "Failed to load genres")
                return
            }
            const data = await res.json()
            setGenres(data)
        } catch (err) {
            setError("Failed getting genres")
            console.log(err)
        }
    }

    useEffect(() => {
        fetchPublicSurveys()
        fetchAnimeGenres()
    }, [])

    const getGenreName = (genreId: string) => {
        if (surveys && surveys.length) {
            const genre = genres.find((g: AnimeGenre) => g.id === genreId)
            return genre ? genre.name : "No genre"
        }
        return ""
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-white">Discover Polls</h1>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {surveys.length === 0 ? (
                    <p>No public surveys found.</p>
                ) : (
                    surveys.map((survey) => (
                        <div
                            key={survey.id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 break-all hover:scale-105 transition-transform duration-200"
                        >
                            <div className="flex justify-end">
                                <p className="pt-0 text-indigo-400 text-sm">{getGenreName(survey.genre_id)}</p>
                            </div>
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

export default DiscoverPage
