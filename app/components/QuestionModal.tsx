"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { authFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "./ToastProvider"

interface Question {
    id: string;
    survey_text: string;
    type: string;
    possible_answers: string[];
}

interface QuestionModalProps {
    surveyId: string;
    question: Question;
    onClose: () => void;
    onSave: () => void;
}

interface RatingConfig {
    range: number;
    displayType: "star" | "slider" | "radio";
    allowHalfSteps: boolean;
    minText: string;
    maxText: string;
}

const defaultRatingConfig: RatingConfig = {
    range: 5,
    displayType: "star",
    allowHalfSteps: false,
    minText: "Very bad",
    maxText: "Perfect"
};

const QuestionModal = memo(({ surveyId, question, onClose, onSave }: QuestionModalProps) => {
    const [questionText, setQuestionText] = useState(question.survey_text);
    const [questionType, setQuestionType] = useState(question.type);
    const [possibleAnswers, setPossibleAnswers] = useState(
        question.type === "multiple-choice" ? question.possible_answers.join(", ") : ""
    );

    // Parse and set initial rating config
    const [ratingConfig, setRatingConfig] = useState<RatingConfig>(() => {
        if (question.type === "rating" && question.possible_answers.length > 0) {
            try {
                return JSON.parse(JSON.parse(question.possible_answers)[0]) as RatingConfig;
            } catch (err) {
                console.error("Error parsing rating config:", err);
                return defaultRatingConfig;
            }
        }
        return defaultRatingConfig;
    });

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { addToast } = useToast();
    const router = useRouter();

    // Handle rating config changes
    const handleRatingConfigChange = useCallback(<K extends keyof RatingConfig>(
        key: K,
        value: RatingConfig[K]
    ) => {
        setRatingConfig(prev => ({ ...prev, [key]: value }));
    }, []);

    // Submit form handler
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        let answersArray: string[] = [];

        if (questionType === "multiple-choice") {
            answersArray = possibleAnswers
                .split(",")
                .map(ans => ans.trim())
                .filter(ans => ans);

            if (answersArray.length === 0) {
                setError("Please provide at least one option for multiple-choice questions.");
                setIsLoading(false);
                return;
            }
        } else if (questionType === "rating") {
            if (!ratingConfig.minText.trim() || !ratingConfig.maxText.trim()) {
                setError("Please provide texts for the minimum and maximum rating values.");
                setIsLoading(false);
                return;
            }
            answersArray = [JSON.stringify(ratingConfig)];
        }

        try {
            const res = await authFetch(`/poll/survey/${surveyId}/questions/${question.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    survey_text: questionText,
                    type: questionType,
                    possible_answers: questionType === "multiple-choice" ? answersArray :
                        questionType === "rating" ? answersArray : [],
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                setError(errData.message || "Failed to update question");
                return;
            }

            onSave();
            addToast("Question updated successfully", "success");
        } catch (err) {
            setError("Failed to update question");
            addToast("An error occurred while updating the question", "error");
        } finally {
            setIsLoading(false);
        }
    }, [
        questionText,
        questionType,
        possibleAnswers,
        ratingConfig,
        surveyId,
        question.id,
        onSave,
        addToast
    ]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 md:w-1/2 p-6" role="document">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Edit Question</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Question Text */}
                    <div>
                        <label htmlFor="question-text" className="block font-medium">Question Text</label>
                        <input
                            id="question-text"
                            type="text"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>

                    {/* Question Type */}
                    <div>
                        <label htmlFor="question-type" className="block font-medium">Question Type</label>
                        <select
                            id="question-type"
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                        >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="text">Text</option>
                            <option value="rating">Rating</option>
                        </select>
                    </div>

                    {/* Multiple Choice Options */}
                    {questionType === "multiple-choice" && (
                        <div>
                            <label htmlFor="possible-answers" className="block font-medium">
                                Possible Answers (comma separated)
                            </label>
                            <input
                                id="possible-answers"
                                type="text"
                                value={possibleAnswers}
                                onChange={(e) => setPossibleAnswers(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                            />
                        </div>
                    )}

                    {/* Rating Options */}
                    {questionType === "rating" && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="rating-range" className="block font-medium">Rating Range</label>
                                <select
                                    id="rating-range"
                                    value={ratingConfig.range}
                                    onChange={(e) => handleRatingConfigChange("range", Number(e.target.value))}
                                    className="border p-2 w-full rounded"
                                >
                                    <option value={5}>1-5</option>
                                    <option value={10}>1-10</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="display-type" className="block font-medium">Display Type</label>
                                <select
                                    id="display-type"
                                    value={ratingConfig.displayType}
                                    onChange={(e) => handleRatingConfigChange(
                                        "displayType",
                                        e.target.value as "star" | "slider" | "radio"
                                    )}
                                    className="border p-2 w-full rounded"
                                >
                                    <option value="star">Star Rating</option>
                                    <option value="slider">Slider</option>
                                    <option value="radio">Radio Buttons</option>
                                </select>
                            </div>

                            {(ratingConfig.displayType === "star" || ratingConfig.displayType === "slider") && (
                                <div className="flex items-center">
                                    <input
                                        id="allow-half-steps"
                                        type="checkbox"
                                        checked={ratingConfig.allowHalfSteps}
                                        onChange={(e) => handleRatingConfigChange("allowHalfSteps", e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="allow-half-steps" className="font-medium">Allow Half Steps</label>
                                </div>
                            )}

                            <div>
                                <label htmlFor="min-text" className="block font-medium">Minimum Value Text</label>
                                <input
                                    id="min-text"
                                    type="text"
                                    value={ratingConfig.minText}
                                    onChange={(e) => handleRatingConfigChange("minText", e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>

                            <div>
                                <label htmlFor="max-text" className="block font-medium">Maximum Value Text</label>
                                <input
                                    id="max-text"
                                    type="text"
                                    value={ratingConfig.maxText}
                                    onChange={(e) => handleRatingConfigChange("maxText", e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

// Add display name for debugging
QuestionModal.displayName = 'QuestionModal';

export default QuestionModal;