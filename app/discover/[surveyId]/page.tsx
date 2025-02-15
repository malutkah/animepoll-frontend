"use client"

import {useState, useEffect} from "react"
import {useParams} from "next/navigation"
import {useToast} from "@/app/components/ToastProvider"
import {fillCacheWithNewSubTreeData} from "next/dist/client/components/router-reducer/fill-cache-with-new-subtree-data";

interface Question {
    id: string;
    survey_text: string;
    type: string;
    possible_answers: string[];
}

interface Survey {
    id: string;
    title: string;
    description: string;
}

interface Response {
    answer_value: string;
    submitted_at: string;
}

const formatTimestamp = (s: string): string => {
    const date = new Date(s);

    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed.
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");

    return `${day}.${month}.${year}  ${hours}:${minutes}`;
}

const PublicSurveyPage = () => {
    const params = useParams() as { surveyId: string }
    const {addToast} = useToast()

    const [survey, setSurvey] = useState<Survey | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [responses, setResponses] = useState<{ [key: string]: string }>({})
    const [results, setResults] = useState<{ [key: string]: Response[] }>({})
    const [error, setError] = useState("")

    const fetchSurveyDetails = async () => {
        try {
            const res = await fetch(`http://localhost:8080/poll/survey/${params.surveyId}/public`)
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
            const res = await fetch(`http://localhost:8080/poll/survey/${params.surveyId}/questions/public`)
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to load questions")
                return
            }
            const data = await res.json()
            setQuestions(data)
        } catch (err) {
            setError("Failed to load questions")
        }
    }

    // In this revised view, we assume GET /poll/survey/:id/results returns, for each question,
    // an array of individual responses (each with answer_value and submitted_at).
    const fetchResults = async () => {
        try {
            const res = await fetch(`http://localhost:8080/poll/survey/${params.surveyId}/responses/public`)
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to load results")
                return
            }
            const data = await res.json()

            // Check if the response is an array.
            if (Array.isArray(data)) {
                // Group responses by question_id (if the API returns an array)
                const groupedResults = data.reduce((acc: { [key: string]: Response[] }, response: Response & {
                    question_id: string
                }) => {
                    if (!acc[response.question_id]) {
                        acc[response.question_id] = []
                    }
                    acc[response.question_id].push(response)
                    return acc
                }, {})
                setResults(groupedResults)
            } else {
                // If it's a single response object, wrap it in an array.
                setResults({[data.question_id]: [data]})
            }
        } catch (err) {
            setError("Failed to load results")
        }
    }


    useEffect(() => {
        fetchSurveyDetails()
        fetchQuestions()
    }, [params.surveyId])

    const handleResponseChange = (questionId: string, value: string) => {
        setResponses((prev) => ({...prev, [questionId]: value}))
    }

    const handleSubmitResponses = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        const payload = {
            responses: questions.map((q) => ({
                question_id: q.id,
                answer_value: responses[q.id] || ""
            }))
        }
        try {
            const res = await fetch(`http://localhost:8080/poll/survey/${params.surveyId}/responses/public`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            })
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to submit responses")
                addToast(err.message || "Failed to submit responses", "error")
                return
            }
            addToast("Responses submitted successfully", "success")
            // Fetch compressed results: display only answer value and submission time.
            fetchResults()
        } catch (err) {
            setError("Failed to submit responses")
            addToast("Failed to submit responses", "error")
        }
    }

    return (
        <div className="space-y-8">
            {error && <p className="text-red-500">{error}</p>}
            {survey ? (
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">{survey.title}</h1>
                    <p className="mt-2 text-gray-600">{survey.description}</p>
                </div>
            ) : (
                <p>Loading survey...</p>
            )}

            {questions.length > 0 ? (
                <form onSubmit={handleSubmitResponses} className="space-y-6 mt-8">
                    {questions.map((question) => (
                        <div key={question.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                            <p className="font-medium text-gray-800 dark:text-gray-100">{question.survey_text}</p>
                            {question.type === "multiple-choice" ? (
                                <div className="mt-2 space-y-2">
                                    {question.possible_answers.map((option, idx) => (
                                        <label key={idx} className="flex items-center">
                                            <input
                                                type="radio"
                                                name={question.id}
                                                value={option}
                                                checked={responses[question.id] === option}
                                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                                className="mr-2"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-2">
                  <textarea
                      name={question.id}
                      placeholder="Your answer..."
                      value={responses[question.id] || ""}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      className="w-full p-2 border rounded"
                  />
                                </div>
                            )}
                        </div>
                    ))}
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Submit Responses
                    </button>
                </form>
            ) : (
                <p>Loading questions...</p>
            )}

            {results && (
                <div className="mt-8">
                    <h2 className="text-3xl font-bold text-gray-800">Survey Results</h2>
                    <div className="mt-4">
                        {Object.entries(results).map(([questionId, responseArray]: [string, any]) => (

                                <div key={questionId} className="p-4 border rounded-lg bg-white dark:bg-gray-800 mb-4">
                                    <p className="font-medium text-gray-800 dark:text-gray-100">
                                        {questions.find(q => q.id === questionId)?.survey_text || "Question"}
                                    </p>
                                    <div className="mt-2 max-h-40 overflow-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                            <tr>
                                                <th className="text-left text-gray-700 dark:text-gray-300">Answer</th>
                                                <th className="text-left text-gray-700 dark:text-gray-300">Time</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {responseArray && responseArray.map((resp, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-1 text-gray-800 dark:text-gray-100">{resp.answer_value}</td>
                                                    <td className="py-1 text-gray-600 dark:text-gray-300">{formatTimestamp(resp.submitted_at)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PublicSurveyPage;
