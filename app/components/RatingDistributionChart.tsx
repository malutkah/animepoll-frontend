"use client"

import BarChart from "./BarChart";

interface RatingDistributionChartProps {
    distribution: { [key: string]: number };
    questionText: string;
}

const RatingDistributionChart = ({ distribution, questionText }: RatingDistributionChartProps) => {
    // Convert the distribution object into an array suitable for the BarChart component.
    const answerValues = Object.entries(distribution).map(([rating, count]) => ({
        text: rating,
        count: count,
    }));

    return (
        <div className="w-full h-64">
            <BarChart questionText={questionText} answerValues={answerValues} />
        </div>
    );
};

export default RatingDistributionChart;
