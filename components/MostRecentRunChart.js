import React from "react";
import { Scatter } from "react-chartjs-2";
import { formatMovingTime } from "@/components/Summary";
import MostRecentRunAiReport from "./MostRecentRunReport";

const getScatterData = (run) => {
  if (!run.splits_metric) return [];
  return run.splits_metric.map((split, index) => ({
    x: (index + 1) * 1000, // Distance in meters
    y: ((split.moving_time / split.distance) * 1000) / 60, // Pace in min/km
  }));
};

const formatDateTime = (dateString) => {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(dateString));
};

const MostRecentRunChart = ({ mostRecentRun }) => {
  const scatterData = getScatterData(mostRecentRun);

  return (
    <div className="w-full flex items-center justify-center border-orange-500 border-2 rounded-xl mb-10 p-4 shadow-xl">
      <div className="w-full">
        <h1 className="text-center font-bold text-lg">Most Recent Run</h1>
        {mostRecentRun ? (
          <div>
            <p>
              <strong>Date:</strong> {formatDateTime(mostRecentRun.start_date)}
            </p>
            <p>
              <strong>Distance:</strong>{" "}
              {(mostRecentRun.distance / 1000).toFixed(2)} km
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {formatMovingTime(mostRecentRun.moving_time)}
            </p>
            {scatterData.length > 0 ? (
              <>
                <Scatter
                  data={{
                    datasets: [
                      {
                        label: "Pace Over Splits",
                        data: scatterData,
                        backgroundColor: "orange",
                        showLine: true,
                        borderColor: "orange",
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    scales: {
                      x: {
                        type: "linear",
                        title: { display: true, text: "Distance (km)" },
                        ticks: {
                          callback: (value) => `${value / 1000} km`, // Format x-axis ticks as km
                        },
                      },
                      y: {
                        title: { display: true, text: "Pace (min/km)" },
                      },
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const xValue = context.raw.x / 1000; // Convert meters to kilometers
                            const yValue = context.raw.y; // Pace in min/km
                            return `Distance: ${xValue.toFixed(
                              1
                            )} km, Pace: ${yValue.toFixed(2)} min/km`;
                          },
                        },
                      },
                    },
                  }}
                />
                <MostRecentRunAiReport mostRecentRun={mostRecentRun} />
              </>
            ) : (
              <p>No split data available for this run.</p>
            )}
          </div>
        ) : (
          <p>No recent run available</p>
        )}
      </div>
    </div>
  );
};

export default MostRecentRunChart;
