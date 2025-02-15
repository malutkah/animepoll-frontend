"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";
import BarChart from "@/app/components/BarChart";

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
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year}  ${hours}:${minutes}`;
};

const PublicSurveyPage = () => {
    const params = useParams() as { surveyId: string };
    const { addToast } = useToast();

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<{ [key: string]: string }>({});
    const [results, setResults] = useState<{ [key: string]: Response[] }>({});
    const [error, setError] = useState("");

    // Fetch survey details
    const fetchSurveyDetails = async () => {
        try {
            const res = await fetch(`http://localhost:8080/poll/survey/${params.surveyId}/public`);
            if (!res.ok) {
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

    // Fetch survey questions
    const fetchQuestions = async () => {
        try {
            const res = await fetch(`http://localhost:8080/poll/survey/${params.surveyId}/questions/public`);
            if (!res.ok) {
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

    // Fetch results for the survey responses
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
                const groupedResults = data.reduce((acc: { [key: string]: Response[] }, response: Response & { question_id: string }) => {
                    if (!acc[response.question_id]) {
                        acc[response.question_id] = [];
                    }
                    acc[response.question_id].push(response);
                    return acc;
                }, {});
                setResults(groupedResults);
            } else {
                setResults({ [data.question_id]: [data] });
            }
        } catch (err) {
            setError("Failed to load results");
        }
    };

    useEffect(() => {
        fetchSurveyDetails();
        fetchQuestions();
        fetchResults();
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
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">{survey.title}</h1>
                    <p className="mt-2 text-gray-600">{survey.description}</p>
                </div>
            ) : (
                <p>Loading survey...</p>
            )}

            {/* Answer Form */}
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
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Submit Responses
                    </button>
                </form>
            ) : (
                <p>Loading questions...</p>
            )}

            {/* BarChart Results for Multiple Choice Questions */}
            <div className="mt-8">
                <h2 className="text-3xl font-bold text-gray-800">Survey Results</h2>
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
                                    <BarChart questionText={question.survey_text} answerValues={optionCounts} />
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default PublicSurveyPage;
