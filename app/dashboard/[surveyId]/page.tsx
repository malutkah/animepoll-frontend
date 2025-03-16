"use client"

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import ProtectedRoute from "@/app/components/ProtectedRoute"
import {authFetch, baseURL, wsURL} from "@/lib/api"
import BarChart from "@/app/components/BarChart";
import RatingDistributionChart from "@/app/components/RatingDistributionChart";
import TextResponsePanel from "@/app/components/TextResponsePanel";

const SurveyDetailPage = () => {
    const params = useParams() as { surveyId: string }
    const router = useRouter()
    const [survey, setSurvey] = useState<Survey | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [error, setError] = useState('')
    const [aggregatedResults, setAggregatedResults] = useState<{
        [key: string]: AggregatedQuestionResult;
    }>({});

    const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
    const [genre, setGenre] = useState("");

    // Toggle state: "questions" or "results"
    const [viewMode, setViewMode] = useState<"questions" | "results">("questions");

    // For result pagination
    const [currentResultIndex, setCurrentResultIndex] = useState(0);


    useEffect(() => {
        let ws: WebSocket;
        const connectWebSocket = () => {
            const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
            const wsUrl = `${wsProtocol}://${wsURL()}/poll/ws/survey/${params.surveyId}`
            ws = new WebSocket(wsUrl);
            ws.onopen = () => {
                console.log("Connected to WebSocket for survey:", params.surveyId);
            };
            ws.onmessage = (event) => {
                try {
                    const data: AggregatedSurveyResult = JSON.parse(event.data);
                    if (data && data.questions) {
                        const aggr = data.questions.reduce((acc: { [key: string]: AggregatedQuestionResult }, q) => {
                            acc[q.question_id] = q;
                            return acc;
                        }, {});
                        setAggregatedResults(aggr);
                    }
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err);
                }
            };
            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
            ws.onclose = () => {
                console.log("WebSocket connection closed, reconnecting in 5 seconds...");
                setTimeout(connectWebSocket, 5000);
            };
        };
        connectWebSocket();
        return () => {
            ws.close();
        };
    }, [params.surveyId]);

    const fetchSurveyDetails = async () => {
        try {
            const res = await authFetch(`/poll/survey/${params.surveyId}`)
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


    // Fetch genres
    const fetchAnimeGenres = async () => {
        try {
            const res = await fetch(baseURL()+"/poll/survey/genres");
            if (res.status !== 200) {
                const err = await res.json();
                setError(err.message || "Failed to load genres");
                return;
            }
            const data = await res.json();
            setGenres(data);
        } catch (err) {
            setError("Failed getting genres");
            console.log(err);
        }
    };

    const fetchQuestions = async () => {
        try {
            const res = await authFetch(`/poll/survey/${params.surveyId}/questions`)
            if (res.status !== 200) {
                const err = await res.json()
                console.log(err)
                setError(err.message || "Failed to load questions")
                return
            }
            const data = await res.json()
            setQuestions(data)
        } catch (err) {
            console.error(err)
            setError("Failed to load questions")
        }
    }

    // Fetch aggregated results from the new endpoint
    const fetchResults = async () => {
        try {
            const res = await fetch(baseURL()+`/poll/survey/${params.surveyId}/results/public`);
            if (res.status !== 200) {
                const err = await res.json();
                setError(err.message || "Failed to load results");
                return;
            }
            const data: AggregatedSurveyResult = await res.json();
            if (data && data.questions) {
                const aggr = data.questions.reduce((acc: { [key: string]: AggregatedQuestionResult }, q) => {
                    acc[q.question_id] = q;
                    return acc;
                }, {});
                console.log('aggr', aggr)
                setAggregatedResults(aggr);
                if (!survey) {
                    setSurvey({
                        id: data.survey_id,
                        title: data.title,
                        description: data.description,
                    });
                }
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load results");
        }
    };

    useEffect(() => {
        fetchSurveyDetails()
        fetchQuestions()
        fetchResults();
        fetchAnimeGenres();
    }, [params.surveyId])

    // Set genre name once survey and genres load
    useEffect(() => {
        if (survey && genres.length > 0 && survey.genre_id) {
            const savedGenre = genres.find((g) => g.id === survey.genre_id);
            if (savedGenre) {
                setGenre(savedGenre.name);
            }
        }
    }, [survey, genres]);

    // Prepare aggregated results as an array for pagination
    const aggregatedResultsArray = Object.values(aggregatedResults);
    const totalResults = aggregatedResultsArray.length;

    return (
        <ProtectedRoute>
            <div className={"space-y-8"}>
                <button onClick={() => router.back()} className="mb-4 text-blue-500">Back</button>
                {error && <p className="text-red-500">{error}</p>}
                {survey ? (
                    <div
                        className="bg-gradient-to-r from-purple-600 to-blue-500 py-8 px-6 rounded-xl shadow-lg animate-fadeIn mb-8">
                        <h1 className="text-4xl font-extrabold text-white mb-3 flex items-center gap-2">
                            {survey.title} <span className="text-2xl animate-pulse">🎌🔥</span>
                        </h1>
                        <p className="text-white text-lg mb-2">{survey.description}</p>
                        {genre && <p className="text-white text-base">Genre: {genre}</p>}
                        <p className="text-white text-lg mb-2">Total Answers: {aggregatedResultsArray.reduce((n, {response_count}) => n + response_count, 0)}</p>
                    </div>
                ) : (
                    <p>Loading survey details...</p>
                )}

                {/* Toggle Button Group */}
                <div className="flex justify-center gap-8">
                    <button
                        onClick={() => setViewMode("questions")}
                        className={`text-lg px-6 py-3 rounded-xl font-semibold transition-colors duration-300 ${
                            viewMode === "questions" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}>Answer Survey
                    </button>

                    <button
                        onClick={() => {
                            setViewMode("results");
                            setCurrentResultIndex(0);
                        }}
                        className={`text-lg px-6 py-3 rounded-xl font-semibold transition-colors duration-300 ${
                            viewMode === "results" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}>View Results
                    </button>

                </div>

                {viewMode === "questions" ? (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-slideInLeft">
                        <h2 className="text-2xl font-semibold mb-2"> Questions </h2>
                        {!questions || questions.length === 0 ? (
                            <p>No questions found.</p>
                        ) : (
                            <ul className="mb-4">
                                {questions && questions.map((q) => (
                                    <li key={q.id} className="border p-2 mb-2 rounded-xl">
                                        <p className="font-medium">Question: {q.survey_text}</p>
                                        <p className="font-medium">Type: {q.type === 'multiple-choice' ? "Multiple Choice" : q.type === 'text' ? "Text" : "Rating"}</p>
                                        <p className="font-medium">{q.type === 'multiple-choice' ? `Possible Answers: ${q.possible_answers.join(' ,')}` :
                                            q.type === 'rating' ? `Answer Type: ${JSON.parse(JSON.parse(q.possible_answers)).displayType}` : ''}</p>

                                    </li>
                                ))}
                            </ul>
                        )
                        }
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-slideInRight">
                        {totalResults > 0 && (
                            <div className="mb-6 flex justify-between items-center">
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    Question {currentResultIndex + 1} of {totalResults}
                                </p>
                                <div className="space-x-3">
                                    <button
                                        onClick={() => setCurrentResultIndex((prev) => Math.max(prev - 1, 0))}
                                        disabled={currentResultIndex === 0}
                                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() =>
                                            setCurrentResultIndex((prev) =>
                                                Math.min(prev + 1, totalResults - 1)
                                            )
                                        }
                                        disabled={currentResultIndex === totalResults - 1}
                                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                        {totalResults === 0 ? (
                            <p className="text-gray-800 dark:text-gray-100">No aggregated results yet...</p>
                        ) : (
                            (() => {
                                const aggResult = aggregatedResultsArray[currentResultIndex];
                                if (aggResult.type === "multiple-choice" || aggResult.type === "multiple_choice") {
                                    return (
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">
                                               Question: {aggResult.question_text}
                                            </h3>
                                            {aggResult.options ? (
                                                <BarChart
                                                    questionText={aggResult.question_text}
                                                    answerValues={aggResult.options.map((opt) => ({
                                                        text: opt.option_text,
                                                        count: opt.count,
                                                    }))}
                                                />
                                            ) : (
                                                <p className="text-gray-800 dark:text-gray-100">No options data.</p>
                                            )}
                                        </div>
                                    );
                                } else if (aggResult.type === "rating") {
                                    return (
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">
                                                Question: {aggResult.question_text}
                                            </h3>
                                            <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
                                                Average
                                                Rating: {aggResult.average_rating ? aggResult.average_rating.toFixed(1) : "N/A"} /
                                                5
                                            </p>
                                            {aggResult.distribution ? (
                                                <RatingDistributionChart
                                                    questionText={aggResult.question_text}
                                                    distribution={aggResult.distribution}
                                                />
                                            ) : (
                                                <p className="text-gray-800 dark:text-gray-100">No distribution
                                                    data.</p>
                                            )}
                                        </div>
                                    );
                                } else if (aggResult.type === "text") {
                                    return (
                                        <TextResponsePanel
                                            question={{
                                                id: aggResult.question_id,
                                                survey_text: aggResult.question_text,
                                                type: aggResult.type,
                                                possible_answers: [],
                                            }}
                                            responses={aggResult.responses || []}
                                        />
                                    );
                                }
                                return null;
                            })()
                        )}
                    </div>
                )}

            </div>
        </ProtectedRoute>
    )
}

export default SurveyDetailPage
