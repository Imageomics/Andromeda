/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase, { defaultConfig }) => {
  let apiURL = "api";
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    apiURL = "http://127.0.0.1:5000/api";
  }
  return {
    images: {
      unoptimized: true
    },
    reactStrictMode: true,
    publicRuntimeConfig: {
      apiURL: apiURL,
    },
    output: "export",
  };
};
