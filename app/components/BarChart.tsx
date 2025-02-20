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

// Preset array of 5 appealing colors
const colorPresets = [
    "rgba(54, 162, 235, 0.8)",   // blue
    "rgba(255, 99, 132, 0.8)",   // red
    "rgba(255, 206, 86, 0.8)",   // yellow
    "rgba(75, 192, 192, 0.8)",   // green/teal
    "rgba(153, 102, 255, 0.8)"   // purple
];

const BarChart = (props: BarChartProps) => {
    // The max value on the x-axis is the total count of responses for the question.
    const totalCount = props.answerValues.reduce((acc, curr) => curr.count > acc ? curr.count : acc, 0);

    const barDataset = props.answerValues.map((value, index) => {
        const bgColor = colorPresets[index % colorPresets.length];
        const borderColor = bgColor;
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
                ticks: {
                    stepSize: 1,
                    color: '#FFF', // Font color for the x-axis tick labels
                    font: {
                        size: 15, // Font size for the x-axis tick labels
                    },
                },
            },
            y: {
                ticks: {
                    color: '#fff',
                    font: {
                        size: 17
                    }
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <div className="w-full h-64 md:h-80">
            <Bar data={data} options={options} />
        </div>
    );
};

export default BarChart;
