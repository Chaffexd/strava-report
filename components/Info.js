import React from "react";

const Info = ({ userName }) => {
  return (
    <div className="text-lg bg-slate-100 p-4 rounded-lg">
      <h1>Hello, <span className="font-bold">{userName}</span>! 👋🏻 🏃<br /> Welcome to the Strava Recap</h1>
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
