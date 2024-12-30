import crypto from "crypto";

export default function handler(req, res) {
  const { STRAVA_CLIENT_ID, STRAVA_REDIRECT_URI } = process.env;

  // random UUID for state value in URL
  const state = crypto.randomBytes(16).toString("hex");

  console.log("Generated state:", state);
  // store state in a cookie
  const isProduction = process.env.NODE_ENV === "production";
  console.log("is prod?", isProduction)
  res.setHeader(
    "Set-Cookie",
    `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; ${
      isProduction ? "Secure" : ""
    }`
  );

  const stravaOAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${STRAVA_REDIRECT_URI}&scope=activity:read_all&state=${state}`;

  res.redirect(stravaOAuthUrl);
}
