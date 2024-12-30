import React from "react";
import { Line } from "react-chartjs-2";

const YearlyEffortsChart = ({ weeklyData }) => {
  return (
    <Line
      className="!w-full min-h-[200px] sm:h-40"
      data={{
        labels: weeklyData.map((week) => week.weekStart), // X-axis: Week start dates
        datasets: [
          {
            label: "Weekly Distance (km)",
            data: weeklyData.map((week) => week.totalDistance / 1000), // Convert meters to km
            backgroundColor: "rgba(255, 165, 0, 0.5)", // Semi-transparent orange for the area
            borderColor: "orange", // Line color
            fill: true, // Fill the area under the line
            tension: 0, // Smooth curve
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.raw.toFixed(2)} km`; // Tooltip format
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Week of the Year" },
          },
          y: {
            title: { display: true, text: "Distance (km)" },
          },
        },
      }}
    />
  );
};

export default YearlyEffortsChart;
