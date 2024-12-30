import React from "react";
import { Scatter } from "react-chartjs-2";

const getScatterData = (effort) => {
  if (!effort.activity?.splits_metric) return [];
  return effort.activity.splits_metric.map((split, index) => ({
    x: (index + 1) * 1000, // Distance in meters
    y: ((split.moving_time / split.distance) * 1000) / 60, // Pace in min/km
  }));
};

const BestEffortCharts = ({ bestEfforts }) => {
  return (
    <>
      {Object.entries(bestEfforts).map(([distance, effort]) => {
        const scatterData = getScatterData(effort);

        return (
          <div
            key={distance}
            className="border-2 border-orange-500 rounded-xl p-4 flex flex-col items-center justify-center w-full sm:w-[49.3%] min-h-80 shadow-xl"
          >
            <p className="text-orange-500 font-bold">{distance}</p>
            <p>{effort.formattedTime || "Disappointed."}</p>
            {scatterData.length > 0 ? (
              <Scatter
                data={{
                  datasets: [
                    {
                      label: `${distance} Splits`,
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
            ) : (
              null
            )}
          </div>
        );
      })}
    </>
  );
};

export default BestEffortCharts;
