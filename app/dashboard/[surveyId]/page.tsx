"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ProtectedRoute from "../../components/ProtectedRoute"
import { authFetch } from "@/lib/api"

interface Question {
    id: string;
    survey_text: string;
    type: string;
    possible_answers: any;
}

interface Survey {
    id: string;
    title: string;
    description: string;
    visibility: string;
}

const SurveyDetailPage = () => {
    const params = useParams() as { surveyId: string }
    const router = useRouter()
    const [survey, setSurvey] = useState<Survey | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [results, setResults] = useState<any>(null)
    const [error, setError] = useState('')

    const fetchSurveyDetails = async () => {
        try {
            const res = await authFetch(`http://localhost:8080/poll/survey/${params.surveyId}`)
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to load survey details")
                return
            }
            const data = await res.json()

            setSurvey(data)
        } catch (err) {
            setError("Failed to load survey details")
        }
    }

    const fetchQuestions = async () => {
        try {
            const res = await authFetch(`http://localhost:8080/poll/survey/${params.surveyId}/questions`)
            if (res.status !== 200) {
                const err = await res.json()
                console.log(err)
                setError(err.message || "Failed to load questions")
                return
            }
            const data = await res.json()

            console.log(data)

            setQuestions(data)
        } catch (err) {
            setError("Failed to load questions")
        }
    }

    const fetchResults = async () => {
        try {
            const res = await authFetch(`http://localhost:8080/poll/survey/${params.surveyId}/results`)
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to load results")
                return
            }
            const data = await res.json()
            setResults(data)
        } catch (err) {
            setError("Failed to load results")
        }
    }

    useEffect(() => {
        fetchSurveyDetails()
        fetchQuestions()
        // fetchResults()
    }, [params.surveyId])

    return (
        <ProtectedRoute>
            <div>
                <button onClick={() => router.back()} className="mb-4 text-blue-500">Back</button>
                {error && <p className="text-red-500">{error}</p>}
                {survey ? (
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
                        <p className="mb-4">{survey.description}</p>
                        <h2 className="text-2xl font-semibold mb-2">Questions</h2>
                        {!questions || questions.length === 0 ? (
                            <p>No questions found.</p>
                        ) : (
                            <ul className="mb-4">
                                {questions && questions.map((q) => (
                                    <li key={q.id} className="border p-2 mb-2">
                                        <p className="font-medium">{q.survey_text}</p>
                                        <p className="text-sm text-gray-600">Type: {q.type}</p>
                                        {q.type === "multiple-choice" ? (<p className="text-sm text-gray-600">Options: {q.possible_answers.join(", ")}</p>): null}
                                        {results && results[q.id] && (
                                            <div className="mt-2">
                                                <h3 className="font-semibold">Results:</h3>
                                                <ul>
                                                    {Object.entries(results[q.id]).map(([option, count]) => (
                                                        <li key={option}>{option}: {count}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : (
                    <p>Loading survey details...</p>
                )}
            </div>
        </ProtectedRoute>
    )
}

export default SurveyDetailPage
