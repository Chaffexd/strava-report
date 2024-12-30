import React from "react";

const LoginPage = () => {
  return (
    <section className="w-full flex justify-center mt-40 items-center flex-col">
      <h1 className="text-2xl font-bold">Welcome to the Strava Report</h1>
      <p className="max-w-2xl my-10 bg-yellow-200 p-8 rounded-xl text-lg">
        The idea here is provide you with insights into your data similar to
        what Strava provides with a slight kick of AI sprinkled on top. The data
        that you see here is taken from your Strava profile using the Strava
        API, it is only accessible to you once you authenticate - your data and
        password is not exposed or readable at any point during this
        authenticate flow as Strava handles the authentication, I just handle
        the keys that are returned to me from the API, these are hashed values. For more information on the flow you
        can read about it <a href="https://developers.strava.com/docs/authentication/" target="_blank" className="text-blue-500 hover:underline">here.</a>
      </p>
      <a
        href="/api/auth/login"
        className="bg-orange-500 text-white p-4 rounded-xl hover:bg-orange-400 font-bold"
      >
        Authenticate to access your Report ⚡️
      </a>
    </section>
  );
};

export default LoginPage;
