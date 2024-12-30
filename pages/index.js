import axios from "axios";
import Info from "@/components/Info";
import * as cookie from "cookie";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  Filler,
} from "chart.js";
import Summary from "@/components/Summary";
import Error from "@/components/Error";
import { formatMovingTime } from "@/components/Summary";
import BestEffortCharts from "@/components/BestEffortCharts";
import YearlyEffortsChart from "@/components/YearlyEffortsChart";
import RunningTimesChart from "@/components/RunningTimesChart";
import AiReport from "@/components/AiReport";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  Filler
);

export default function Home({
  stats,
  bestEfforts,
  error,
  currentUser,
  weeklyData,
  timeCategories,
}) {
  if (error) {
    return <Error error={error} />;
  }

  const { ytd_run_totals } = stats;
  /*   console.log("BEST EFFORTS in component =", bestEfforts);
  console.log("Current user =", currentUser);
  console.log("Stats =", stats);
  console.log("weekly data in component", weeklyData);
  console.log("timeCategories", timeCategories); */
  const { firstname, lastname, city, state } = currentUser;
  const fullName = `${firstname} ${lastname}`;

  return (
    <section className="m-auto w-full flex justify-center flex-col items-center p-4 sm:p-0 sm:mt-24 max-w-screen-xl text-lg ">
      <Info userName={fullName} city={city} state={state} />
      <Summary ytd_run_totals={ytd_run_totals} />
      <div className="w-full mt-10 ">
        <div className="border-2 border-orange-500 w-full sm:h-auto h-auto rounded-xl p-4 flex items-center flex-col text-lg">
          <p>Efforts over the year</p>
          <YearlyEffortsChart weeklyData={weeklyData} />
        </div>
        <div className="w-full border-orange-500 flex flex-wrap my-10 gap-4 my-justify-between">
          <BestEffortCharts bestEfforts={bestEfforts} />
        </div>
        <div>
          <RunningTimesChart runningTimes={timeCategories} />
        </div>
        <div>
          <AiReport
            stats={stats}
            bestEfforts={bestEfforts}
            currentUser={currentUser}
            timeCategories={timeCategories}
          />
        </div>
      </div>
    </section>
  );
}

export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const accessToken = cookies.access_token;

 /*  console.log("Request headers:", req.headers);
  console.log("Request cookies:", cookie.parse(req.headers.cookie || ""));
  console.log("Has accessToken", accessToken) */

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!accessToken) {
    return {
      redirect: {
        destination: "/login",
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

  const timeCategories = {
    morning: 0,
    afternoon: 0,
    evening: 0,
  };

  const bestEfforts = {};
  for (const key in targetDistances) {
    bestEfforts[key] = { time: Infinity, activity: null };
  }

  const weeklyDistances = {};

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

      runningActivities.forEach((run) => {
        const startTime = new Date(run.start_date);
        const hour = startTime.getUTCHours();

        if (hour >= 0 && hour < 12) {
          timeCategories.morning++;
        } else if (hour >= 12 && hour <= 18) {
          timeCategories.afternoon++;
        } else {
          timeCategories.evening++;
        }
      });

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

      runningActivities.forEach((run) => {
        const weekStart = new Date(run.start_date);
        weekStart.setUTCHours(0, 0, 0, 0);

        // Adjust the day so Monday is the start of the week
        const day = weekStart.getDay();
        const diff = (day === 0 ? -6 : 1) - day; // If Sunday (0), move back 6 days; otherwise, adjust to Monday (1)
        weekStart.setDate(weekStart.getDate() + diff);

        const weekKey = weekStart.toISOString().split("T")[0];
        if (!weeklyDistances[weekKey]) {
          weeklyDistances[weekKey] = 0;
        }
        weeklyDistances[weekKey] += run.distance; // Add distance in meters
      });
    }

    const weeklyData = Object.entries(weeklyDistances)
      .map(([weekStart, totalDistance]) => ({ weekStart, totalDistance }))
      .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));

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
        weeklyData,
        timeCategories,
      },
    };
  } catch (error) {
    console.error("Error fetching data from Strava:", error.message);
    return {
      props: { error: error.message },
    };
  }
}
