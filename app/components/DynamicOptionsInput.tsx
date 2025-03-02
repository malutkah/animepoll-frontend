"use client"

import { useCallback, memo } from "react"

interface DynamicOptionsInputProps {
    options: string[]
    onChange: (options: string[]) => void
    maxOptions?: number
}

const DynamicOptionsInput = memo(({ options, onChange, maxOptions }: DynamicOptionsInputProps) => {
    // Memoize event handlers to prevent unnecessary re-renders
    const handleOptionChange = useCallback((index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        onChange(newOptions)
    }, [options, onChange]);

    const handleAddOption = useCallback(() => {
        if (maxOptions && options.length >= maxOptions) return
        onChange([...options, ""])
    }, [options, onChange, maxOptions]);

    const handleRemoveOption = useCallback((index: number) => {
        const newOptions = options.filter((_, i) => i !== index)
        onChange(newOptions)
    }, [options, onChange]);

    const isMaxOptionsReached = maxOptions ? options.length >= maxOptions : false;

    return (
        <div>
            <label className="block font-medium">Options</label>
            {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mt-2">
                    <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 p-2 border rounded"
                        placeholder={`Option ${index + 1}`}
                    />
                    <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-500"
                        aria-label={`Remove option ${index + 1}`}
                    >
                        Remove
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={handleAddOption}
                className={`mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded ${isMaxOptionsReached ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isMaxOptionsReached}
            >
                Add Option
            </button>
            {isMaxOptionsReached && (
                <p className="text-sm text-gray-500">Maximum of {maxOptions} options reached.</p>
            )}
            {/*
            Additional ideas for question types:
            - Rating Scale (e.g., 1-5 stars)
            - Ranking (order items based on preference)
            - Matrix (multiple rows of choices)
            - Open-Ended Text (for detailed responses)
            */}
        </div>
    )
});

// Add display name for debugging
DynamicOptionsInput.displayName = 'DynamicOptionsInput';

export default DynamicOptionsInput;