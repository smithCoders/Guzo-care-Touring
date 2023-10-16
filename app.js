const express = require("express");
const morgan = require("morgan");
const app = express();

const tourRouter = require("./src/Routes/tourRoute");
const userRouter = require("./src/Routes/userRoute");
const errorMiddleware = require("./src/middlewares/errorMiddleware");
// run morgan logging only if the app is on developement server.
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

// Router middleware
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
// error middleware.
app.use(errorMiddleware);

module.exports = app;
