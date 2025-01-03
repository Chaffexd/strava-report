import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import OpenAI from "openai";
import { BeatLoader } from "react-spinners";
import { formatMovingTime } from "@/components/Summary";

const MostRecentRunAiReport = ({ mostRecentRun }) => {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);

    const prompt = `
      You are an AI running coach. Generate a detailed report for this recent run:
      
      Date: ${new Intl.DateTimeFormat("en-GB", {
        dateStyle: "short",
        timeStyle: "medium",
      }).format(new Date(mostRecentRun.start_date))}

      Distance: ${(mostRecentRun.distance / 1000).toFixed(2)} km
      Moving Time: ${formatMovingTime(mostRecentRun.moving_time)}
      Elevation Gain: ${mostRecentRun.total_elevation_gain || 0} meters
      
      Splits (Pace in min/km):
      ${
        mostRecentRun.splits_metric
          ? mostRecentRun.splits_metric
              .map(
                (split, index) =>
                  `- Split ${index + 1}: ${(
                    ((split.moving_time / split.distance) * 1000) /
                    60
                  ).toFixed(2)} min/km`
              )
              .join("\n")
          : "No split data available"
      }

      Heart rate: ${mostRecentRun.average_heartrate} bpm

      Generate a motivational and actionable report focusing on this run's performance and areas for improvement.
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

  if (!mostRecentRun) {
    return <p>No recent run data available to generate a report.</p>;
  }

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
          Generate AI Report for Most Recent Run
        </button>
      )}

      {report && (
        <div className="mt-4 p-4 border-2 border-orange-500 rounded-lg bg-orange-100 mb-40">
          <h3 className="text-lg font-bold mb-2">AI Report</h3>
          <ReactMarkdown className="whitespace-pre-line">{report}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default MostRecentRunAiReport;
