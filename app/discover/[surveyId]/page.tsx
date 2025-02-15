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
    const [results, setResults] = useState<{ [key: string]: Response[] }>({});
    const [error, setError] = useState("");

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

    // Fetch results from API and group responses by question_id
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

            {/* For each multiple-choice question, render the BarChart */}
            {questions
                .filter((q) => q.type === "multiple-choice" && results[q.id])
                .map((question) => {
                    // Group responses by answer option and count them
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
    );
};

export default PublicSurveyPage;
