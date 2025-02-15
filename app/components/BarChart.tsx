"use client"

import { Bar } from "react-chartjs-2";
import { CategoryScale, Chart } from "chart.js";
import 'chart.js/auto';

Chart.register(CategoryScale);

interface AnswerValues {
    text: string
    percentValue: number
}

interface BarChartProps {
    questionText: string
    answerValues: AnswerValues[]
}

const generateColors = () => {
    let bgColor = '';
    let borderColor = '';

    const r = Math.floor(150 + Math.random() * 106); // random number between 150 and 255
    const g = Math.floor(150 + Math.random() * 106);
    const b = Math.floor(150 + Math.random() * 106);
    bgColor = `rgba(${r}, ${g}, ${b}, 0.2)`
    borderColor = `rgba(${r}, ${g}, ${b}, 0.2)`

    return {bgColor, borderColor}
}

const BarChart = (props: BarChartProps) => {
    let barDataset = [];
    props.answerValues.forEach((value) => {
        const randomBgColor = generateColors().bgColor
        const randomBorderColor = generateColors().borderColor
        const d = {
            label: value.text,
            data: [value.percentValue],
            backgroundColor: [
                randomBgColor,
            ],
            borderColor: [
                randomBorderColor
            ],
            borderWidth: 1
        }
        barDataset.push(d)
    })


    const data = {
        labels: [props.questionText],
        datasets: barDataset,
    };

    const options = {
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                max: 100, // sets maximum to 100 for percent display
                ticks: {
                    callback: function(value) {
                        return value + '%'; // appends % to each tick label
                    },
                },
            },
        },
    };

    return (
        <div>
            <Bar data={data} options={options} />
        </div>
    )
}

export default BarChart;
