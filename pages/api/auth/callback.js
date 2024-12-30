import axios from "axios";
import * as cookie from "cookie";

export default async function handler(req, res) {
  const { code, state } = req.query;

  // Retrieve and verify the state
  const cookies = cookie.parse(req.headers.cookie || "");
  const savedState = cookies.oauth_state;

  console.log("State from query:", state);
  console.log("State from cookie:", savedState);

  if (!state || state !== savedState) {
    return res
      .status(400)
      .json({ error: "Invalid or missing state parameter." });
  }

  // Exchange the authorization code for an access token
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI } =
    process.env;

  try {
    const tokenResponse = await axios.post(
      "https://www.strava.com/oauth/token",
      {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: STRAVA_REDIRECT_URI,
      }
    );

    const { access_token, refresh_token, athlete } = tokenResponse.data;

    // Set access token and athlete info in cookies or a session
    res.setHeader("Set-Cookie", [
      cookie.serialize("access_token", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      }),
      cookie.serialize("refresh_token", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      }),
      cookie.serialize("athlete", JSON.stringify(athlete), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      }),
      cookie.serialize("athlete_id", athlete.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      }),
    ]);

    // Redirect the user
    res.redirect("/");
  } catch (error) {
    console.error(
      "Error exchanging authorization code:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to exchange authorization code." });
  }
}
