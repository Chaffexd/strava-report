import React from "react";

const Info = ({ userName, city, state }) => {
  return (
    <div className="text-lg bg-yellow-200 p-8 rounded-lg">
      <h1>Hello, <span className="font-bold">{userName}</span> from {city}, {state} 👋🏻 🏃 !<br /> Welcome to the Strava Recap</h1>
      <div>
        <p>
          The data that you see here is taken using the Public Strava API which
          is only available upon authentication, by authenticating you are
          giving permission to the application to fetch your information from
          Strava.
        </p>
      </div>
    </div>
  );
};

export default Info;
