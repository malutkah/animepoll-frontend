"use client"

import { useState, useMemo, memo } from "react";
import { formatTimestamp } from "@/lib/utils";

interface Question {
    id: string;
    survey_text: string;
    type: string;
    possible_answers: any[];
}

interface AggregatedTextResponse {
    submitted_at: string;
    answer_value: string;
}

interface TextResponsePanelProps {
    question: Question;
    responses: AggregatedTextResponse[];
}

const TextResponsePanel = memo(({ question, responses }: TextResponsePanelProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

    // Memoize sorted responses to prevent re-sorting on each render
    const sortedResponses = useMemo(() => {
        return [...responses].sort((a, b) => {
            const timeA = new Date(a.submitted_at).getTime();
            const timeB = new Date(b.submitted_at).getTime();
            return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
        });
    }, [responses, sortOrder]);

    return (
        <div className="mb-6 border border-gray-300 rounded-xl overflow-hidden shadow-md">
            <button
                type="button"
                className="w-full flex justify-between items-center bg-gray-800 text-white px-4 py-2 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="text-responses-panel"
            >
                <span className="font-bold text-lg">Question: {question.survey_text}</span>
                <span className="text-sm">{isOpen ? "Hide Responses" : "Show Responses"}</span>
            </button>

            {isOpen && (
                <div
                    id="text-responses-panel"
                    className="p-4 bg-gray-900 text-white transition-all duration-300"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">Sort Responses:</span>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                            aria-label="Sort responses by"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>

                    {sortedResponses.length > 0 ? (
                        <ul className="divide-y divide-gray-700">
                            {sortedResponses.map((resp, idx) => (
                                <li key={idx} className="py-2 transition-opacity duration-300 hover:bg-gray-600">
                                    <div className="text-base">{resp.answer_value}</div>
                                    <div className="text-xs text-gray-400">
                                        {formatTimestamp(resp.submitted_at)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No responses yet.</p>
                    )}
                </div>
            )}
        </div>
    );
});

// Add display name for debugging
TextResponsePanel.displayName = 'TextResponsePanel';

export default TextResponsePanel;