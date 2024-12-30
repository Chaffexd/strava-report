import axios from "axios";
import Info from "@/components/Info";
import * as cookie from "cookie";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import Summary from "@/components/Summary";
import Error from "@/components/Error";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LinearScale,
  PointElement,
  LineElement
);

export default function Home({ stats, bestEfforts, error, currentUser }) {
  if (error) {
    return (
      <Error error={error} />
    );
  }

  const { ytd_run_totals } = stats;
  console.log("BEST EFFORTS =", bestEfforts);
  console.log("Current user =", currentUser);
  const { firstname, lastname, city, state } = currentUser;
  const fullName = `${firstname} ${lastname}`;

  const getScatterData = (effort) => {
    if (!effort.activity?.splits_metric) return [];
    return effort.activity.splits_metric.map((split, index) => ({
      x: (index + 1) * 1000, // Distance in meters
      y: ((split.moving_time / split.distance) * 1000) / 60, // Pace in min/km
    }));
  };

  return (
    <section className="m-auto w-full flex justify-center flex-col items-center mt-24 max-w-screen-xl text-lg">
      <Info userName={fullName} city={city} state={state} />
      <Summary ytd_run_totals={ytd_run_totals} />
      <div className="w-full mt-10">
        <div className="border-2 border-orange-500 h-40 w-full rounded-xl p-4 flex items-center text-lg">
          <p>Best Efforts</p>
        </div>
        <div className="w-full border-orange-500 h-40 flex flex-wrap mt-10 gap-4 justify-between">
          {Object.entries(bestEfforts).map(([distance, effort]) => {
            const scatterData = getScatterData(effort);

            return (
              <div
                key={distance}
                className="border-2 border-orange-500 rounded-xl p-4 flex flex-col items-center justify-center w-[48%] min-h-80"
              >
                <p className="text-orange-500 font-bold">{distance}</p>
                <p>{effort.formattedTime || "Get Running..."}</p>
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
                  <p className="text-sm">No splits data available.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const accessToken = cookies.access_token;
  const athleteId = cookies.athlete_id;

  if (!accessToken) {
    return {
      redirect: {
        destination: "/api/auth/login",
        permanent: false,
      },
    };
  }

  const authenticatedUserUrl = `https://www.strava.com/api/v3/athlete`;
  const activitiesUrl = `https://www.strava.com/api/v3/athlete/activities`;
  const activityDetailsUrl = (id) =>
    `https://www.strava.com/api/v3/activities/${id}`;

  const runs = [];
  const perPage = 100;
  let page = 1;
  let hasMore = true;
  const startOfYear = Math.floor(
    new Date(new Date().getFullYear(), 0, 1).getTime() / 1000
  );
  const today = Math.floor(Date.now() / 1000);
  const targetDistances = {
    "5km": 5000,
    "10km": 10000,
    "15km": 15000,
    "Half Marathon": 21097.5,
    "30km": 30000,
    Marathon: 42195,
  };

  const bestEfforts = {};
  for (const key in targetDistances) {
    bestEfforts[key] = { time: Infinity, activity: null };
  }

  try {
    const authenticatedUserResponse = await axios.get(authenticatedUserUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const authenticatedUser = authenticatedUserResponse.data;

    while (hasMore) {
      const activitiesResponse = await axios.get(
        `${activitiesUrl}?after=${startOfYear}&before=${today}&page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const activities = activitiesResponse.data;

      if (activities.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }

      const runningActivities = activities.filter(
        (activity) => activity.type === "Run"
      );
      runs.push(...runningActivities);
    }

    for (const run of runs) {
      const distance = run.distance; // in meters
      const movingTime = run.moving_time; // in seconds

      for (const [label, targetDistance] of Object.entries(targetDistances)) {
        if (
          distance >= targetDistance * 0.95 &&
          distance <= targetDistance * 1.05 &&
          movingTime < bestEfforts[label].time
        ) {
          const activityDetailsResponse = await axios.get(
            activityDetailsUrl(run.id),
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const activityDetails = activityDetailsResponse.data;

          bestEfforts[label] = {
            time: movingTime,
            formattedTime: formatMovingTime(movingTime),
            activity: activityDetails,
          };
        }
      }
    }

    return {
      props: {
        currentUser: authenticatedUser,
        stats: {
          ytd_run_totals: {
            count: runs.length,
            distance: runs.reduce((sum, run) => sum + run.distance, 0),
            moving_time: runs.reduce((sum, run) => sum + run.moving_time, 0),
            elevation_gain: runs.reduce(
              (sum, run) => sum + run.total_elevation_gain || 0,
              0
            ),
          },
        },
        bestEfforts,
      },
    };
  } catch (error) {
    console.error("Error fetching data from Strava:", error.message);
    return {
      props: { error: error.message },
    };
  }
}
