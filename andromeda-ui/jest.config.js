module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  moduleNameMapper: {
    'd3': '<rootDir>/node_modules/d3/dist/d3.min.js',
  },
};
