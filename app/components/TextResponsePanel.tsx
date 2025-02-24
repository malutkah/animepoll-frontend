import {useState} from "react";
import {formatTimestamp} from "@/lib/utils";

const TextResponsePanel = ({question,responses,}: {
    question: Question;
    responses: AggregatedTextResponse[];
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

    const sortedResponses = [...responses].sort((a, b) => {
        // Simple sort (could be replaced with timestamp-based sort)
        return sortOrder === "newest"
            ? new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
            : new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    });

    return (
        <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden shadow-md">
            <button
                type="button"
                className="w-full flex justify-between items-center bg-gray-800 text-white px-4 py-2 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-bold text-lg">Question: {question.survey_text}</span>
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
                                <div className="text-base">{resp.answer_value}</div>
                                <div className="text-xs text-gray-400">{formatTimestamp(resp.submitted_at)}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TextResponsePanel;