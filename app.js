const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const app = express();
const tourRouter = require("./src/Routes/tourRoute");
const userRouter = require("./src/Routes/userRoute");
const reviewRouter = require("./src/Routes/reviewRoute");
const newsletterRouter = require("./src/Routes/newsLetterRouter");
const bookingRouter=require("./src/Routes/bookingRoute");
const reservationRouter=require("./src/Routes/reservationRoute");
const accomodationRouter=require("./src/Routes/accommodationRoutes");
const notificationRouter=require("./src/Routes/notificationRoute");
const errorMiddleware = require("./src/middlewares/errorMiddleware");
const appError = require("./src/utils/appErrors");

// GLOBAL-MIDDLEWARES.
// set Security of HTTP heaers
app.use(helmet());

// run morgan logging only if the app is on developement server.
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// RATE-LIMIT.
const limiter = rateLimit({
  // max number of request per IP.
  max: 100,
  // the  time  allowed  to request.(in this case user can send 100 request in 1hr)
  windowMS: 60 * 60 * 1000,
  // error message if user send to many request.
  message: "too many request, please try again after an hour",
});
// limit requestof api from same IP address
app.use("/api", limiter);
// body parser,  reading data from  req.bdoy
// limit:"10kb"= limt the data  to parse in to   body
app.use(express.json({ limit: "10kb" }));
// Data  sanitization against NOSQL query injection.
app.use(mongoSanitize());
// Data sanitization against cross side scripting attack(XSS)
// prevent parameter pollution
app.use(
  hpp({
    // allow  some fields to  return duplicates in query string
    whitelist: ["duration", "ratingQuantity", "maxGroupSize", "difficulty"],
  })
);
// Router middleware
app.use("/api/v1", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/newsletter", newsletterRouter);
app.use("/api/v1/bookings",bookingRouter);
app.use("/api/v1/reservation",reservationRouter);
app.use("/api/v1/accomodation",accomodationRouter);
app.use("/api/v1/notification",notificationRouter);
// app.use("/api/v1/bookings",bookingRouter);

app.all("*", (req, res, next) => {
  // N.B:- if we pass argument to next(), then express knows is is an error and stop all other  middlewares from run
  next(new appError(`Page not found(${req.originalUrl})`, 404));
});

// error middleware.
app.use(errorMiddleware);
module.exports = app;
