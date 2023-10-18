const express = require("express");
const morgan = require("morgan");
const app = express();

const tourRouter = require("./src/Routes/tourRoute");
const userRouter = require("./src/Routes/userRoute");
const errorMiddleware = require("./src/middlewares/errorMiddleware");
const appError = require("./src/utils/appErrors");

// run morgan logging only if the app is on developement server.
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

// Router middleware
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.all("*", (req, res, next) => {
  // N.B:- if we pass argument to next(), then express knows is is an error and stop all other  middlewares from run
  next(new appError(`Page not found(${req.originalUrl})`, 404));
});

// error middleware.
app.use(errorMiddleware);
module.exports = app;
