"use client"

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import ProtectedRoute from "../../components/ProtectedRoute"
import {authFetch} from "@/lib/api"
import BarChart from "@/app/components/BarChart";
import {formatTimestamp} from "@/app/discover/[surveyId]/page";

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

interface Response {
    answer_value: string;
    submitted_at: string;
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
            console.error(err)
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
            console.error(err)
            setError("Failed to load questions")
        }
    }

    const fetchResults = async () => {
        try {
            const res = await fetch(`http://localhost:8080/poll/survey/${params.surveyId}/responses/public`);
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || "Failed to load results");
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                const groupedResults = data.reduce((acc: { [key: string]: Response[] }, response: Response & {
                    question_id: string
                }) => {
                    if (!acc[response.question_id]) {
                        acc[response.question_id] = [];
                    }
                    acc[response.question_id].push(response);
                    return acc;
                }, {});
                setResults(groupedResults);
            } else {
                setResults({[data.question_id]: [data]});
            }
        } catch (err) {
            console.error(err)
            setError("Failed to load results");
        }
    };

    useEffect(() => {
        fetchSurveyDetails()
        fetchQuestions()
        fetchResults()
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
                                        <p className="font-medium">Type: {q.type === 'multiple-choice' ? "Multiple Choice" : "Text"}</p>
                                        <p className="font-medium">{q.type === 'multiple-choice' ? `Possible Answers: ${q.possible_answers.join(' ,')}` : ''}</p>

                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-8">
                            <h2 className="text-3xl font-bold text-white">Multiple Choice Results</h2>
                            {!results || results.length === 0 ? (
                                <p>No results yet...</p>
                            ) : (
                                <div className="mt-4">
                                    {questions
                                        .filter((q) => q.type === "multiple-choice" && results[q.id])
                                        .map((question) => {
                                            const responseArray = results[question.id];
                                            const optionCounts = question.possible_answers.map((option) => ({
                                                text: option,
                                                count: responseArray.filter((resp) => resp.answer_value === option).length,
                                            }));
                                            return (
                                                <div key={question.id} className="mb-8">
                                                    <BarChart questionText={question.survey_text}
                                                              answerValues={optionCounts}/>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}

                        </div>
                        <div className="mt-8">
                            <h2 className="text-3xl font-bold text-white">Text Responses</h2>
                            {!results || results.length === 0 ? (
                                <p>No results yet...</p>
                            ) : (
                                <div className="mt-4">
                                    {results && questions
                                        .filter((q) => q.type === "text" && results[q.id])
                                        .map((question) => (
                                            <div key={question.id} className="mb-8">
                                                <h3 className="text-xl font-bold">{question.survey_text} –
                                                    Responses</h3>
                                                <ul className="list-disc ml-5">
                                                    {results[question.id].map((resp, idx) => (
                                                        <li key={idx} className="text-white">
                                                            {resp.answer_value} <span
                                                            className="text-sm text-white">({formatTimestamp(resp.submitted_at)})</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p>Loading survey details...</p>
                )}
            </div>
        </ProtectedRoute>
    )
}

export default SurveyDetailPage
