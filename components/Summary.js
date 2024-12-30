import React from "react";

export function formatMovingTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

const Summary = ({ ytd_run_totals }) => {
  return (
    <div className="flex flex-wrap w-full gap-10 mt-8">
      <div className="border-2 border-orange-500 h-40 w-full sm:w-72 rounded-xl p-4 text-lg flex flex-col items-center justify-center shadow-xl">
        <p className="text-orange-500 font-bold ">{ytd_run_totals.count}</p>
        <p>👟 # of Runs</p>
      </div>
      <div className="border-2 border-orange-500 h-40 w-full sm:w-72 rounded-xl p-4 text-lg flex flex-col items-center justify-center shadow-xl">
        <p className="text-orange-500 font-bold">
          {(ytd_run_totals.distance / 1000).toFixed(2)}km
        </p>
        <p>🗺️ Total Distance</p>
      </div>
      <div className="border-2 border-orange-500 h-40 w-full sm:w-72 rounded-xl p-4 text-lg flex flex-col items-center justify-center shadow-xl">
        <p className="text-orange-500 font-bold">
          {formatMovingTime(ytd_run_totals.moving_time)}
        </p>
        <p>🏃 Spent Running</p>
      </div>
      <div className="border-2 border-orange-500 h-40 w-full sm:w-72 rounded-xl p-4 text-lg flex flex-col items-center justify-center shadow-xl">
        <p className="text-orange-500 font-bold">
          {ytd_run_totals.elevation_gain.toFixed(0)}
        </p>
        <p>🧗 Meters climbed</p>
      </div>
    </div>
  );
};

export default Summary;
