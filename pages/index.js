import axios from "axios";
import Info from "@/components/Info";
import * as cookie from "cookie";

function formatMovingTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours} hours ${minutes} minutes`;
}

export default function Home({ stats, error }) {
  if (error) {
    return (
      <section className="m-auto w-full flex justify-center flex-col items-center mt-24 max-w-screen-xl text-lg">
        <p className="text-red-500">Error: {error}</p>
      </section>
    );
  }

  const { ytd_run_totals, summary } = stats;
  console.log("Summary", summary);
  console.log("TYD Run Totals =", ytd_run_totals);
  

  return (
    <section className="m-auto w-full flex justify-center flex-col items-center mt-24 max-w-screen-xl text-lg">
      <Info userName={"Shane Chaffe"} />
      <div className="flex gap-10 mt-8">
        <div className="border-2 border-orange-500 h-40 w-72 rounded-xl p-4 text-lg flex flex-col items-center justify-center">
          <p className="text-orange-500 font-bold">{ytd_run_totals.count}</p>
          <p>👟 # of Runs</p>
        </div>
        <div className="border-2 border-orange-500 h-40 w-72 rounded-xl p-4 text-lg flex flex-col items-center justify-center">
          <p className="text-orange-500 font-bold">
            {(ytd_run_totals.distance / 1000).toFixed(2)}km
          </p>
          <p>🗺️ Total Distance</p>
        </div>
        <div className="border-2 border-orange-500 h-40 w-72 rounded-xl p-4 text-lg flex flex-col items-center justify-center">
          <p className="text-orange-500 font-bold">
            {formatMovingTime(ytd_run_totals.moving_time)}
          </p>
          <p>🏃 Spent Running</p>
        </div>
        <div className="border-2 border-orange-500 h-40 w-72 rounded-xl p-4 text-lg flex flex-col items-center justify-center">
          <p className="text-orange-500 font-bold">
            {ytd_run_totals.elevation_gain.toFixed(0)}
          </p>
          <p>🧗 Meters climbed</p>
        </div>
      </div>
      <div className="w-full mt-10">
        <div className="border-2 border-orange-500 h-40 w-full rounded-xl p-4 flex items-center text-lg">
          <p>Year-over-Year Progression</p>
        </div>
        <div className="w-full border-orange-500 h-40 flex flex-wrap mt-10 gap-4 justify-between">
          {["5km", "10km", "16km", "Half Marathon", "30km", "Marathon"].map(
            (race, idx) => (
              <div
                key={idx}
                className="border-2 border-orange-500 h-40 rounded-xl p-4 flex items-center text-lg w-[32.5%]"
              >
                <p>{race}</p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const accessToken = cookies.access_token;
  const athleteId = cookies.athlete_id;
  console.log("ATHELETE ID =", athleteId)

  if (!accessToken) {
    return {
      redirect: {
        destination: "/api/auth/login",
        permanent: false,
      },
    };
  }

  const statsUrl = `https://www.strava.com/api/v3/athletes/${athleteId}/stats`;
  const activitiesUrl = `https://www.strava.com/api/v3/athlete/activities`;

  const runs = [];
  const perPage = 100;
  let page = 1;
  let hasMore = true;

  const countries = {};
  const kudosCount = {};
  const startDates = [];

  try {
    const statsResponse = await axios.get(statsUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const stats = statsResponse.data;

    // Loop through paginated data
    while (hasMore) {
      const activitiesResponse = await axios.get(
        `${activitiesUrl}?page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const activities = activitiesResponse.data;

      // Filter for running activities
      const runningActivities = activities.filter(
        (activity) => activity.type === "Run"
      );
      runs.push(...runningActivities);

      // If fewer than `perPage` items are returned, stop pagination
      if (activities.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    }

    runs.forEach((run) => {
      // Normalize and track countries
      if (run.location_country) {
        const country = run.location_country.trim().toLowerCase();
        countries[country] = (countries[country] || 0) + 1;
      } else {
        console.warn(`Activity ID ${run.id} has no country information.`);
      }

      kudosCount[run.start_date] = run.kudos_count;

      startDates.push(run.start_date);
    });

    return {
      props: {
        stats: {
          ytd_run_totals: stats.ytd_run_totals,
          activities: runs,
          summary: {
            countries,
            kudosCount,
            startDates,
          },
        },
      },
    };
  } catch (error) {
    console.error("Error fetching data from Strava:", error.message);
    // If user is not authenticated, then redirect to login path so make them authenticate, user must also be logged into strava for the flow to be successful
    if (error.response && error.response.status === 401) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    return {
      props: { error: error.message },
    };
  }
}
