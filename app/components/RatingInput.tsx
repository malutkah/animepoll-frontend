"use client"

import React from "react";
import { Star } from "lucide-react";

export interface RatingInputProps {
    range?: number;
    displayType?: "star" | "slider" | "radio";
    allowHalfSteps?: boolean;
    minText?: string;
    maxText?: string;
    value: number;
    onChange: (value: number) => void;
    interactive?: boolean;
}

const RatingInput: React.FC<RatingInputProps> = ({
                                                     range = 5,
                                                     displayType = "star",
                                                     allowHalfSteps = false,
                                                     minText = "Very bad",
                                                     maxText = "Perfect",
                                                     value,
                                                     onChange,
                                                     interactive = true,
                                                 }) => {
    if (displayType === "star") {
        const stars = [];
        const step = allowHalfSteps ? 0.5 : 1;
        for (let i = step; i <= range; i += step) {
            let icon;
            if (value >= i) {
                icon = <Star key={i} className="h-6 w-6 text-yellow-400" />;
            } else if (allowHalfSteps && value >= i - step && value < i) {
                icon = <Star key={i} className="h-6 w-6 text-yellow-400 opacity-50" />;
            } else {
                icon = <Star key={i} className="h-6 w-6 text-gray-300" />;
            }
            stars.push(
                <span
                    key={i}
                    onClick={() => interactive && onChange(i)}
                    className={interactive ? "cursor-pointer transition-transform duration-200 hover:scale-110" : ""}
                >
          {icon}
        </span>
            );
        }
        return (
            <div className="flex items-center">
                <span className="mr-2 text-sm">{minText}</span>
                <div className="flex">{stars}</div>
                <span className="ml-2 text-sm">{maxText}</span>
            </div>
        );
    } else if (displayType === "slider") {
        return (
            <div className="flex items-center">
                <span className="mr-2 text-sm">{minText}</span>
                <input
                    type="range"
                    min={allowHalfSteps ? 0.5 : 1}
                    max={range}
                    step={allowHalfSteps ? 0.5 : 1}
                    value={value}
                    onChange={(e) => interactive && onChange(parseFloat(e.target.value))}
                    className="mx-2 w-full h-2 bg-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    disabled={!interactive}
                />
                <span className="ml-2 text-sm">{maxText}</span>
            </div>
        );
    } else if (displayType === "radio") {
        const options = [];
        const step = allowHalfSteps ? 0.5 : 1;
        for (let i = allowHalfSteps ? 0.5 : 1; i <= range; i += step) {
            options.push(i);
        }
        return (
            <div className="flex flex-wrap gap-2 items-center">
                <span className="mr-2 text-sm">{minText}</span>
                {options.map((opt) => (
                    <label key={opt} className="flex items-center">
                        <input
                            type="radio"
                            name="rating"
                            value={opt}
                            checked={value === opt}
                            onChange={() => interactive && onChange(opt)}
                            disabled={!interactive}
                            className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-indigo-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 mr-1"
                        />
                        <span className="text-sm">{opt}</span>
                    </label>
                ))}
                <span className="mr-2 text-sm">{maxText}</span>
            </div>
        );
    } else {
        return null;
    }
};

export default RatingInput;
