"use client"

import { useState } from "react"
import { authFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "./ToastProvider"

interface Question {
    id: string
    survey_text: string
    type: string
    possible_answers: string[]
}

interface QuestionModalProps {
    surveyId: string
    question: Question
    onClose: () => void
    onSave: () => void
}

const defaultRatingConfig = {
    range: 5,
    displayType: "star",
    allowHalfSteps: false,
    minText: "Very bad",
    maxText: "Perfect"
};

const QuestionModal = ({ surveyId, question, onClose, onSave }: QuestionModalProps) => {
    const [questionText, setQuestionText] = useState(question.survey_text)
    const [questionType, setQuestionType] = useState(question.type)
    // For multiple-choice, use comma-separated string; for rating, parse config from JSON string
    const [possibleAnswers, setPossibleAnswers] = useState(question.type === "multiple-choice" ? question.possible_answers.join(", ") : "")
    const initialRatingConfig = (() => {
        if (question.type === "rating" && question.possible_answers.length > 0) {
            try {
                return JSON.parse(JSON.parse(question.possible_answers)[0])
            } catch (err) {
                return defaultRatingConfig
            }
        }
        return defaultRatingConfig
    })()
    const [ratingConfig, setRatingConfig] = useState(initialRatingConfig)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { addToast } = useToast()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        let answersArray: string[] = []
        if (questionType === "multiple-choice") {
            answersArray = possibleAnswers.split(",").map(ans => ans.trim()).filter(ans => ans)
            if (answersArray.length === 0) {
                setError("Please provide at least one option for multiple-choice questions.")
                setIsLoading(false)
                return
            }
        } else if (questionType === "rating") {
            if (!ratingConfig.minText.trim() || !ratingConfig.maxText.trim()) {
                setError("Please provide texts for the minimum and maximum rating values.")
                setIsLoading(false)
                return
            }
            answersArray = [JSON.stringify(ratingConfig)]
        }
        try {
            const res = await authFetch(`http://localhost:8080/poll/survey/${surveyId}/questions/${question.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    survey_text: questionText,
                    type: questionType,
                    possible_answers: questionType === "multiple-choice" ? answersArray : questionType === "rating" ? answersArray : [],
                }),
            })
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to update question")
                return
            }
            onSave()
        } catch (err) {
            setError("Failed to update question")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 md:w-1/2 p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Edit Question</h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium">Question Text</label>
                        <input
                            type="text"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-medium">Question Type</label>
                        <select
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                        >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="text">Text</option>
                            <option value="rating">Rating</option>
                        </select>
                    </div>
                    {questionType === "multiple-choice" && (
                        <div>
                            <label className="block font-medium">Possible Answers (comma separated)</label>
                            <input
                                type="text"
                                value={possibleAnswers}
                                onChange={(e) => setPossibleAnswers(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                            />
                        </div>
                    )}
                    {questionType === "rating" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium">Rating Range</label>
                                <select
                                    value={ratingConfig.range}
                                    onChange={(e) => setRatingConfig({ ...ratingConfig, range: Number(e.target.value) })}
                                    className="border p-2 w-full rounded"
                                >
                                    <option value={5}>1-5</option>
                                    <option value={10}>1-10</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium">Display Type</label>
                                <select
                                    value={ratingConfig.displayType}
                                    onChange={(e) => setRatingConfig({ ...ratingConfig, displayType: e.target.value })}
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
                                        type="checkbox"
                                        checked={ratingConfig.allowHalfSteps}
                                        onChange={(e) => setRatingConfig({ ...ratingConfig, allowHalfSteps: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="font-medium">Allow Half Steps</span>
                                </div>
                            )}
                            <div>
                                <label className="block font-medium">Minimum Value Text</label>
                                <input
                                    type="text"
                                    value={ratingConfig.minText}
                                    onChange={(e) => setRatingConfig({ ...ratingConfig, minText: e.target.value })}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                            <div>
                                <label className="block font-medium">Maximum Value Text</label>
                                <input
                                    type="text"
                                    value={ratingConfig.maxText}
                                    onChange={(e) => setRatingConfig({ ...ratingConfig, maxText: e.target.value })}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
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
    )
}

export default QuestionModal
