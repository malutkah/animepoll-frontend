"use client"

import React, {useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/app/components/ProtectedRoute"
import {authFetch, baseURL} from "@/lib/api"
import {InfoIcon} from "lucide-react";
import useTranslation from "@/lib/useTranslation";

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
    const [genres, setGenres] = useState<AnimeGenre[]>([])
    const [genreId, setGenreId] = useState('')
    const [genre, setGenre] = useState('')
    const router = useRouter()
    const {t} = useTranslation()

    // {t('common.survey.')}
    // {t('common.')}
    // t('common.survey.')
    // t('common.errors.err_')
    // t('common.')

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
                setError(err.message || t('common.errors.err_survey_create'))
                return
            }
            router.push("/dashboard")
        } catch (err) {
            setError(t('common.errors.err_survey_create'))
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
                setError(err.message || t('common.errors.err_genre_load'));
                return;
            }
            const data = await res.json()
            setGenres(data);

        } catch (err) {
            setIsLoading(false);
            setError(t('common.errors.err_genre_load'));
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenreSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;

        const g = genres.find((g: AnimeGenre) => g.name === selected);

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
                <h1 className="text-3xl font-bold mb-4">{t('common.survey.create_survey')}</h1>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block">{t('common.survey.title')}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border p-2 w-full rounded-xl"
                            required
                        />
                    </div>
                    <div>
                        <label className="block">{t('common.survey.description')}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border p-2 w-full rounded-xl"
                            required
                        />
                    </div>
                    <div>
                        <label className={"block"}>Genre</label>
                        {genres && genres.length > 0 ? (
                            <select
                                value={genre}
                                onChange={handleGenreSelect}
                                className={"border p-2 w-full rounded-xl"}
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
                        <label className="block">{t('common.survey.visibility')}</label>
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            className="border p-2 w-full bg-gray-900 border-gray-300 rounded-xl"
                        >
                            {/*<option value="public">Public</option>*/}
                            <option value="private">{t('common.survey.private')}</option>
                        </select>
                        <span className={"flex align-middle mt-4"}>
                            <InfoIcon className={"text-orange-400 mr-4"} />
                            <p className={"text-orange-400"}>{t('common.survey.cant_set_public')}</p>
                        </span>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="dark:bg-emerald-700 dark:hover:bg-green-800 text-white font-bold py-2 px-4 rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                        {isLoading ? t('common.creating') : t('common.survey.create_survey')}
                    </button>
                </form>
            </div>
        </ProtectedRoute>
    )
}

export default CreateSurveyPage
