import React from 'react'

const Error = ({ error }) => {
  return (
    <section className="m-auto w-full flex justify-center flex-col items-center mt-24 max-w-screen-xl text-lg">
        <p className="text-red-500">Error: {error}</p>
      </section>
  )
}

export default Error