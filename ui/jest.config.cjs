module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.jsx$": "babel-jest",
    "^.+\\.ts$": "ts-jest",
    "^.+\\.tsx$": "ts-jest",
    "^.+\\.css$": "jest-transform-stub",
    "^.+\\.svg$": "jest-transform-stub",
  },
};
