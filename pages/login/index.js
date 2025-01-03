import Head from "next/head";
import React, { useEffect, useState } from "react";

const LoginPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for athlete in cookies
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {});

    console.log("COOKIEs ", cookies);
    if (cookies.athlete) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <>
      <Head>
        <title>{"Strava Recap | Shane Chaffe"}</title>
        <meta name="description" content={"A recap of your year on Strava"} key={"desc"} />
        <meta name="og:title" content={"Strava Recap | Shane Chaffe"} />
        <meta property="og:description" content={"Strava Recap | Shane Chaffe"} />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />
        <meta
          property="og:site_name"
          content={"Strava Recap | Shane Chaffe"}
        />
      </Head>
      <section className="w-full flex justify-center mt-10 sm:mt-40 items-center flex-col p-4">
        <h1 className="text-2xl font-bold">Welcome to the Strava Report</h1>
        <p className="max-w-2xl my-10 bg-yellow-200 p-8 rounded-xl text-lg">
          The idea here is to provide you with insights into your data similar
          to what Strava provides with a slight kick of AI sprinkled on top. The
          data that you see here is taken from your Strava profile using the
          Strava API, it is only accessible to you once you authenticate - your
          data and password is not exposed or readable at any point during this
          authentication flow as Strava handles the authentication, I just
          handle the keys that are returned to me from the API, these are hashed
          values. For more information on the flow you can read about it{" "}
          <a
            href="https://developers.strava.com/docs/authentication/"
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            here.
          </a>
        </p>
        {isAuthenticated ? (
          <a
            href="/"
            className="bg-green-500 text-white p-4 rounded-xl hover:bg-green-400 font-bold mb-8"
          >
            Go to Your Report 🚀
          </a>
        ) : (
          <a
            href="/api/auth/login"
            className="bg-orange-500 text-white p-4 rounded-xl hover:bg-orange-400 font-bold mb-8"
          >
            Authenticate to access your Report ⚡️
          </a>
        )}
      </section>
    </>
  );
};

export default LoginPage;
