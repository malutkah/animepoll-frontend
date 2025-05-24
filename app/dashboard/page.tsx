"use client"

import {useEffect, useState} from "react"
import Link from "next/link"
import ProtectedRoute from "@/app/components/ProtectedRoute"
import {authFetch, baseURL} from "@/lib/api"
import { useMessage } from "@/app/components/MessageBoxExport";
import useTranslation from "@/lib/useTranslation";

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

    const {t} = useTranslation();

    const [genres, setGenres] = useState<AnimeGenre[]>([])

    const fetchSurveys = async () => {
        try {
            const res = await authFetch("/poll/survey/all")
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || t('common.errors.err_survey_load'))
                return
            }
            const data = await res.json()
            setSurveys(data)
        } catch (err: any) {
            setError(t('common.errors.err_survey_load'))
        }
    }

    const fetchAnimeGenres = async () => {
        try {
            const res = await fetch(baseURL()+"/poll/survey/genres")
            if (res.status !== 200) {
                const err = await res.json();
                setError(err.message || t('common.errors.err_genres_load'));
                return;
            }
            const data = await res.json()
            setGenres(data);

        } catch (err) {
            setError(t('common.errors.err_genres_load'));
             console.error(err)
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
                return t('common.errors.err_no_genre');
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
            title: t('common.survey.delete_survey'),
            message: t('common.msg_confirm.delete_survey '),
            onConfirm: async () => {
                try {
                    const res = await authFetch(`/poll/survey/${id}`, {
                        method: "DELETE"
                    })
                    if (!res.ok) {
                        const err = await res.json()
                        showMessage({
                            type: 'error',
                            title: t('common.errors.err_deletion'),
                            message: err.message || t('common.errors.err_question_delete'),
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
                <h1 className="text-4xl font-bold mb-6 text-white">{t('common.dashboard')}</h1>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder={t('common.survey.search_surveys')}
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
                        {t('common.survey.create_survey')}
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
                                        {t('common.pg_discover.view_survey')}
                                    </Link>
                                    <Link
                                        href={`/dashboard/${survey.id}/edit`}
                                        className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-1 px-3 rounded"
                                    >
                                        {t('common.edit')}
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(survey.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                                    >
                                        {t('common.delete')}
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
