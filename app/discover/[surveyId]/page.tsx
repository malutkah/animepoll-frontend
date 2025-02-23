"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";
import BarChart from "@/app/components/BarChart";
import { authFetch } from "@/lib/api";
import RichTextEdit from "@/app/components/RichTextEdit";
import RatingInput, { RatingInputProps } from "@/app/components/RatingInput";

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
}

interface Response {
    answer_value: string;
    submitted_at: string;
}

interface AnimeGenre {
    id: string;
    name: string;
}

type AnimeGenres = AnimeGenre[];

export const formatTimestamp = (s: string): string => {
    const date = new Date(s);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year}  ${hours}:${minutes}`;
};

// Collapsible component for text responses
const TextResponsePanel = ({ question, responses }: { question: Question; responses: Response[]; }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

    const sortedResponses = [...responses].sort((a, b) => {
        const dateA = new Date(a.submitted_at).getTime();
        const dateB = new Date(b.submitted_at).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return (
        <div className="mb-8 border border-gray-300 rounded-lg overflow-hidden shadow-md">
            <button
                type="button"
                className="w-full flex justify-between items-center bg-gray-800 text-white px-4 py-2 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-bold">Question: {question.survey_text}</span>
                <span className="text-sm">{isOpen ? "Hide Responses" : "Show Responses"}</span>
            </button>
            {isOpen && (
                <div className="p-4 bg-gray-900 text-white transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">Sort Responses:</span>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                    <ul className="divide-y divide-gray-700">
                        {sortedResponses.map((resp, idx) => (
                            <li key={idx} className="py-2 transition-opacity duration-300 hover:bg-gray-600">
                                <div>{resp.answer_value}</div>
                                <div className="text-xs text-gray-400">{formatTimestamp(resp.submitted_at)}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const PublicSurveyPage = () => {
    const params = useParams() as { surveyId: string };
    const { addToast } = useToast();

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<{ [key: string]: string }>({});
    const [results, setResults] = useState<{ [key: string]: Response[] }>({});
    const [error, setError] = useState("");
    const [genres, setGenres] = useState<AnimeGenre[]>([]);

    const [genre, setGenre] = useState("");

    // Fetch survey details
    const fetchSurveyDetails = async () => {
        try {
            const res = await fetch(`http://localhost:8080/poll/survey/${params.surveyId}/public`);
            if (res.status !== 200) {
                const err = await res.json();
                setError(err.message || "Failed to load survey details");
                return;
            }
            const data = await res.json();
            setSurvey(data);
        } catch (err) {
            setError("Failed to load survey details");
        }
    };

    const fetchAnimeGenres = async () => {
        try {
            const res = await fetch("http://localhost:8080/poll/survey/genres");
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
            const res = await fetch(`http://localhost:8080/poll/survey/${params.surveyId}/questions/public`);
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
            const res = await fetch(`http://localhost:8080/poll/survey/${params.surveyId}/responses/public`);
            if (res.status !== 200) {
                const err = await res.json();
                setError(err.message || "Failed to load results");
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                const groupedResults = data.reduce((acc: { [key: string]: Response[] }, response: Response & { question_id: string }) => {
                    if (!acc[response.question_id]) {
                        acc[response.question_id] = [];
                    }
                    acc[response.question_id].push(response);
                    return acc;
                }, {});
                setResults(groupedResults);
            } else if (data) {
                setResults({ [data.question_id]: [data] });
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load results");
        }
    };

    useEffect(() => {
        if (survey && genres.length > 0) {
            const savedGenre = genres.find((g: AnimeGenre) => g.id === (survey as any).genre_id);
            if (savedGenre) {
                setGenre(savedGenre.name);
            }
        }
    }, [survey, genres]);

    useEffect(() => {
        fetchSurveyDetails();
        fetchQuestions();
        fetchResults();
        fetchAnimeGenres();
    }, [params.surveyId]);

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
            const res = await fetch(`http://localhost:8080/poll/survey/${params.surveyId}/responses/public`, {
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

    return (
        <div className="space-y-8">
            {error && <p className="text-red-500">{error}</p>}
            {survey ? (
                <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold text-white mb-2">Survey: {survey.title}</h1>
                    <p className="mt-2 text-white">{survey.description}</p>
                    <p className="mt-2 text-white">Genre: {genre ? genre : "N/A"}</p>
                </div>
            ) : (
                <p>Loading survey...</p>
            )}

            {questions.length > 0 ? (
                <form onSubmit={handleSubmitResponses} className="space-y-6 mt-8">
                    <h2 className="text-2xl font-bold text-white">Please answer the following questions:</h2>
                    {questions.map((question, i) => (
                        <div key={question.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Question:</h3>
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">{question.survey_text}</p>
                            {question.type === "multiple-choice" ? (
                                <>
                                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-400">Select an Answer:</h4>
                                    <div className="mt-1 space-y-2">
                                        {question.possible_answers.map((option, idx) => (
                                            <label key={idx} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`${question.id}-${i}`}
                                                    value={option}
                                                    checked={responses[question.id] === option}
                                                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                                    className="mr-2"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            ) : question.type === "rating" ? (
                                // Render interactive RatingInput for rating questions.
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
                                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-400">Your Answer:</h4>
                                    <div className="mt-1">
                    <textarea
                        name={question.id}
                        placeholder="Type your answer here..."
                        value={responses[question.id] || ""}
                        maxLength={1000}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        className="w-full p-2 border rounded bg-gray-900"
                    />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Submit Responses
                    </button>
                </form>
            ) : (
                <p>Loading questions...</p>
            )}

            {/* Multiple Choice Results */}
            <div className="mt-8">
                <h2 className="text-3xl font-bold text-white">Multiple Choice Results</h2>
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
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                        Results for: {question.survey_text}
                                    </h3>
                                    <BarChart questionText={question.survey_text} answerValues={optionCounts} />
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* Text Response Results with Collapsible Panels */}
            <div className="mt-8">
                <h2 className="text-3xl font-bold text-white">Text Responses</h2>
                <div className="mt-4 space-y-4">
                    {questions
                        .filter((q) => q.type === "text" && results[q.id])
                        .map((question) => (
                            <TextResponsePanel key={question.id} question={question} responses={results[question.id]} />
                        ))}
                </div>
            </div>
        </div>
    );
};

export default PublicSurveyPage;
