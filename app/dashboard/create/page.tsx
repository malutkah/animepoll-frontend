"use client"

import React, {useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/app/components/ProtectedRoute"
import {authFetch, baseURL} from "@/lib/api"

interface AnimeGenre {
    id: string;
    name: string;
}

type AnimeGenres = AnimeGenre[];

const CreateSurveyPage = () => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [visibility, setVisibility] = useState('private')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [genres, setGenres] = useState<AnimeGenres | []>([])
    const [genreId, setGenreId] = useState('')
    const [genre, setGenre] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const res = await authFetch("/poll/survey", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, visibility, 'genre_id':genreId })
            })
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to create survey")
                return
            }
            router.push("/dashboard")
        } catch (err) {
            setError("Failed to create survey")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchAnimeGenres = async () => {
        setIsLoading(true);

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
            setIsLoading(false);
            setError("Failed getting genres");
            console.log(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenreSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        console.log('selected',selected)

        const g = genres.find((g) => g.name === selected);
        console.log('g',g)
        if (g) {
            setGenre(g.name)
            setGenreId(g.id)
        } else {
            setGenre("")
        }
    }

    useEffect(() => {
        fetchAnimeGenres()
    }, []);

    return (
        <ProtectedRoute>
            <div>
                <h1 className="text-3xl font-bold mb-4">Create New Survey</h1>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border p-2 w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border p-2 w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className={"block"}>Genre</label>
                        {genres && genres.length > 0 ? (
                            <select
                                value={genre}
                                onChange={handleGenreSelect}
                                className={"border p-2 w-full rounded"}
                                required
                            >
                                <option value={""}>Select a Genre</option>
                                {genres.map((g) => (
                                    <option key={g.id} value={g.name}>{g.name}</option>
                                ))}

                            </select>
                        ) : (<p>Loading Genres</p>)}
                    </div>
                    <div>
                        <label className="block">Visibility</label>
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            className="border p-2 w-full bg-gray-900 border-gray-300"
                        >
                            {/*<option value="public">Public</option>*/}
                            <option value="private">Private</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                        {isLoading ? "Creating..." : "Create Survey"}
                    </button>
                </form>
            </div>
        </ProtectedRoute>
    )
}

export default CreateSurveyPage
