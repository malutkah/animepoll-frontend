"use client"

import React, { useMemo, memo } from 'react';
import BarChart from "./BarChart";

interface RatingDistributionChartProps {
    distribution: { [key: string]: number };
    questionText: string;
}

const RatingDistributionChart = memo(({ distribution, questionText }: RatingDistributionChartProps) => {
    // Memoize the answerValues calculation
    const answerValues = useMemo(() => {
        return Object.entries(distribution).map(([rating, count]) => ({
            text: rating,
            count: count,
        }));
    }, [distribution]);

    return (
        <div className="w-full h-64">
            <BarChart questionText={questionText} answerValues={answerValues} />
        </div>
    );
});

// Add display name for debugging
RatingDistributionChart.displayName = 'RatingDistributionChart';

export default RatingDistributionChart;