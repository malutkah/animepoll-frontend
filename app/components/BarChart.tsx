"use client"

import { Bar } from "react-chartjs-2";
import { CategoryScale, Chart } from "chart.js";
import 'chart.js/auto';

Chart.register(CategoryScale);

interface AnswerValue {
    text: string;
    count: number;
}

interface BarChartProps {
    questionText: string;
    answerValues: AnswerValue[];
}

// Generate random colors for each dataset
const generateColors = () => {
    const r = Math.floor(150 + Math.random() * 106); // random number between 150 and 255
    const g = Math.floor(150 + Math.random() * 106);
    const b = Math.floor(150 + Math.random() * 106);
    const bgColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
    const borderColor = `rgba(${r}, ${g}, ${b}, 1)`;
    return { bgColor, borderColor };
};

const BarChart = (props: BarChartProps) => {
    // The maximum value on the x-axis is the total count of answers
    const totalCount = props.answerValues.reduce((acc, curr) => acc + curr.count, 0);

    const barDataset = props.answerValues.map((value) => {
        const { bgColor, borderColor } = generateColors();
        return {
            label: value.text,
            data: [value.count],
            backgroundColor: [bgColor],
            borderColor: [borderColor],
            borderWidth: 1,
        };
    });

    const data = {
        labels: [props.questionText],
        datasets: barDataset,
    };

    const options = {
        indexAxis: 'y' as const,
        scales: {
            x: {
                beginAtZero: true,
                max: totalCount,
            },
        },
    };

    return (
        <div>
            <Bar data={data} options={options} />
        </div>
    );
};

export default BarChart;
