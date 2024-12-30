import React, { useState } from "react";
import OpenAI from "openai";
import { BeatLoader } from "react-spinners";

const AiReport = ({ stats, bestEfforts, currentUser, timeCategories }) => {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);

    // Format the data to provide context for the AI
    const prompt = `
      You are an AI running coach. Generate a detailed report for the runner:
      
      Runner Name: ${currentUser.firstname} ${currentUser.lastname}
      Location: ${currentUser.city}, ${currentUser.state}
      
      Year-to-Date Stats:
      - Total Runs: ${stats.ytd_run_totals.count}
      - Total Distance: ${(stats.ytd_run_totals.distance / 1000).toFixed(2)} km
      - Total Moving Time: ${Math.floor(
        stats.ytd_run_totals.moving_time / 3600
      )} hours
      - Total Elevation Gain: ${stats.ytd_run_totals.elevation_gain.toFixed(
        0
      )} meters

      Time Categories:
      - Morning Runs: ${timeCategories.morning}
      - Afternoon Runs: ${timeCategories.afternoon}
      - Evening Runs: ${timeCategories.evening}

      Best Efforts:
      ${Object.entries(bestEfforts)
        .map(
          ([distance, effort]) =>
            `- ${distance}: ${effort.formattedTime || "No data available"}`
        )
        .join("\n")}

      Generate a motivational and actionable report focusing on their achievements and areas for improvement.
    `;

    try {
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are an AI running coach." },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      console.log("Response =", response.choices[0].message.content);
      setReport(response.choices[0].message.content);
    } catch (error) {
      console.error("Error generating AI report:", error);
      setReport("There was an error generating your report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full my-10 flex justify-center flex-col items-center min-h-60">
      {loading ? (
        <BeatLoader color="#f39416" />
      ) : (
        <button
          onClick={generateReport}
          className={`px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 mb-6 ${
            report && "invisible"
          }`}
          disabled={loading}
        >
          Generate AI Report
        </button>
      )}

      {report && (
        <div className="mt-4 p-4 border-2 border-orange-500 rounded-lg bg-orange-30 bg-orange-100 mb-40">
          <h3 className="text-lg font-bold mb-2">AI Report</h3>
          <p className="whitespace-pre-line">{report}</p>
        </div>
      )}
    </div>
  );
};

export default AiReport;
