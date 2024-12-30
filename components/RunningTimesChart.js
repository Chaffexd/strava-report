import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const RunningTimesChart = ({ runningTimes }) => {
  const data = {
    labels: ["Morning", "Afternoon", "Evening"], // Labels for the doughnut chart
    datasets: [
      {
        label: "Runs by Time of Day",
        data: [
          runningTimes.morning,
          runningTimes.afternoon,
          runningTimes.evening,
        ], // Values for each category
        backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"], // Colors for each segment
        hoverBackgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"], // Colors on hover
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value} runs`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-80 flex items-center justify-center border-orange-500 border-2 rounded-xl mb-10 p-4 shadow-xl">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default RunningTimesChart;
