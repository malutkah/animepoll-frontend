"use client"

import { useState } from "react"

interface DynamicOptionsInputProps {
    options: string[]
    onChange: (options: string[]) => void
}

const DynamicOptionsInput = ({ options, onChange }: DynamicOptionsInputProps) => {
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        onChange(newOptions)
    }

    const handleAddOption = () => {
        onChange([...options, ""])
    }

    const handleRemoveOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index)
        onChange(newOptions)
    }

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
                    <button type="button" onClick={() => handleRemoveOption(index)} className="text-red-500">
                        Remove
                    </button>
                </div>
            ))}
            <button type="button" onClick={handleAddOption} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
                Add Option
            </button>
            {/*
        Additional ideas for question types:
        - Rating Scale (e.g., 1-5 stars)
        - Ranking (order items based on preference)
        - Matrix (multiple rows of choices)
        - Open-Ended Text (for detailed responses)
      */}
        </div>
    )
}

export default DynamicOptionsInput
