"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";
import BarChart from "@/app/components/BarChart";
import RatingInput, { RatingInputProps } from "@/app/components/RatingInput";
import RatingDistributionChart from "@/app/components/RatingDistributionChart";
import TextResponsePanel from "@/app/components/TextResponsePanel";
import {authFetch, baseURL, wsURL} from "@/lib/api";

const PublicSurveyPage = () => {
    const params = useParams() as { surveyId: string };
    const { addToast } = useToast();

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<{ [key: string]: string }>({});
    const [aggregatedResults, setAggregatedResults] = useState<{ [key: string]: AggregatedQuestionResult }>({});
    const [error, setError] = useState("");
    const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
    const [genre, setGenre] = useState("");

    // Toggle state: "questions" or "results"
    const [viewMode, setViewMode] = useState<"questions" | "results">("questions");
    // For result pagination
    const [currentResultIndex, setCurrentResultIndex] = useState(0);

    // Initial fetching of survey details, questions, results, and genres
    useEffect(() => {
        fetchSurveyDetails();
        fetchQuestions();
        fetchResults();
        fetchAnimeGenres();
    }, [params.surveyId]);

    // WebSocket integration for real‑time updates
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
            const res = await fetch(baseURL()+`/poll/survey/${params.surveyId}/public`);
            if (res.status !== 200) {
                const err = await res.json();
                setError(err.message || "Failed to load survey details");
                return;
            }
            const data = await res.json();
            setSurvey({
                id: data.survey_id,
                title: data.title,
                description: data.description,
                genre_id: data.genre_id,
            });
        } catch (err) {
            setError("Failed to load survey details");
        }
    };

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
            const res = await fetch(baseURL()+`/poll/survey/${params.surveyId}/questions/public`);
            if (res.status !== 200) {
                const err = await res.json();
                setError(err.message || "Failed to load questions");
                return;
            }
            const data = await res.json();
            setQuestions(data);
        } catch (err) {
            setError("Failed to load questions");
        }
    };

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

    // Set genre name once survey and genres load
    useEffect(() => {
        if (survey && genres.length > 0 && survey.genre_id) {
            const savedGenre = genres.find((g) => g.id === survey.genre_id);
            if (savedGenre) {
                setGenre(savedGenre.name);
            }
        }
    }, [survey, genres]);

    const handleResponseChange = (questionId: string, value: string) => {
        setResponses((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmitResponses = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const payload = {
            responses: questions.map((q) => ({
                question_id: q.id,
                answer_value: responses[q.id] || "",
            })),
        };
        try {
            const res = await fetch(baseURL()+`/poll/survey/${params.surveyId}/responses/public`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || "Failed to submit responses");
                addToast(err.message || "Failed to submit responses", "error");
                return;
            }
            addToast("Responses submitted successfully", "success");
            fetchResults();
        } catch (err) {
            setError("Failed to submit responses");
            addToast("Failed to submit responses", "error");
        }
    };

    // Prepare aggregated results as an array for pagination
    const aggregatedResultsArray = Object.values(aggregatedResults);
    const totalResults = aggregatedResultsArray.length;

    return (
        <div className="space-y-8">
            {error && <p className="text-red-500">{error}</p>}
            {/* Survey Header */}
            {survey ? (
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 py-8 px-6 rounded-xl shadow-lg animate-fadeIn mb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-3 flex items-center gap-2">
                        {survey.title} <span className="text-2xl animate-pulse">🎌🔥</span>
                    </h1>
                    <p className="text-white text-lg mb-2">{survey.description}</p>
                    {genre && <p className="text-white text-base">Genre: {genre}</p>}
                </div>
            ) : (
                <p>Loading survey details...</p>
            )}

            {/* Toggle Button Group */}
            <div className="flex justify-center gap-6">
                <button
                    onClick={() => setViewMode("questions")}
                    className={`text-lg px-6 py-3 rounded-xl font-semibold transition-colors duration-300 ${
                        viewMode === "questions" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                >
                    Answer Survey
                </button>
                <button
                    onClick={() => {
                        setViewMode("results");
                        setCurrentResultIndex(0);
                    }}
                    className={`text-lg px-6 py-3 rounded-xl font-semibold transition-colors duration-300 ${
                        viewMode === "results" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                >
                    View Results
                </button>
            </div>

            {viewMode === "questions" ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-slideInLeft">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Questions</h2>
                    {questions.length > 0 ? (
                        <form onSubmit={handleSubmitResponses} className="space-y-6">
                            {questions.map((question, i) => (
                                <div key={question.id} className="p-6 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        {question.survey_text}
                                    </h3>
                                    {question.type === "multiple-choice" || question.type === "multiple_choice" ? (
                                        <>
                                            <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Select an Answer:</p>
                                            <div className="space-y-3">
                                                {question.possible_answers.map((option: string, idx: number) => (
                                                    <label key={idx} className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name={`${question.id}-${i}`}
                                                            value={option}
                                                            checked={responses[question.id] === option}
                                                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                                            className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 mr-3"
                                                        />
                                                        <span className="text-base text-gray-800 dark:text-gray-200">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </>
                                    ) : question.type === "rating" ? (
                                        (() => {
                                            let ratingConfig: RatingInputProps = {
                                                range: 5,
                                                displayType: "star",
                                                allowHalfSteps: false,
                                                minText: "Very bad",
                                                maxText: "Perfect",
                                                value: 0,
                                                onChange: (val: number) => handleResponseChange(question.id, String(val)),
                                                interactive: true,
                                            };
                                            if (JSON.parse(question.possible_answers).length > 0) {
                                                try {
                                                    const parsed = JSON.parse(JSON.parse(question.possible_answers)[0]);
                                                    ratingConfig = {
                                                        range: parsed.range || 5,
                                                        displayType: parsed.displayType || "star",
                                                        allowHalfSteps: parsed.allowHalfSteps || false,
                                                        minText: parsed.minText || "Very bad",
                                                        maxText: parsed.maxText || "Perfect",
                                                        value: Number(responses[question.id] || 0),
                                                        onChange: (val: number) => handleResponseChange(question.id, String(val)),
                                                        interactive: true,
                                                    };
                                                } catch (e) {
                                                    console.error("Error parsing rating settings", e);
                                                }
                                            }
                                            return <RatingInput {...ratingConfig} />;
                                        })()
                                    ) : (
                                        <>
                                            <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Your Answer:</p>
                                            <div>
                                                <textarea
                                                    name={question.id}
                                                    placeholder="Type your answer here..."
                                                    value={responses[question.id] || ""}
                                                    maxLength={1000}
                                                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md">
                                Submit Responses
                            </button>
                        </form>
                    ) : (
                        <p className="text-gray-800 dark:text-gray-100">No questions found.</p>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-slideInRight">
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
                                            {aggResult.question_text}
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
                                            {aggResult.question_text}
                                        </h3>
                                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
                                            Average Rating: {aggResult.average_rating ? aggResult.average_rating.toFixed(1) : "N/A"} / 5
                                        </p>
                                        {aggResult.distribution ? (
                                            <RatingDistributionChart
                                                questionText={aggResult.question_text}
                                                distribution={aggResult.distribution}
                                            />
                                        ) : (
                                            <p className="text-gray-800 dark:text-gray-100">No distribution data.</p>
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
    );
};

export default PublicSurveyPage;
