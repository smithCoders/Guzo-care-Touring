const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
// const sendProdError = (err, res) => {
//   // Operational error: error that we can predict and handle.
//   if (err.isOperational) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//     // Programming error: error that we can not predict and handle.
//   } else {
//     console.error("ERROR: ", err);
//     res.status(500).json({
//       status: "error",
//       message: "Something went wrong",
//     });
//   }
// };
module.exports = (err, req, res, next) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;
  // if (process.env.NODE_ENV === "developement") {
  sendDevError(err, res);
  //  else if (process.env.NODE_ENV === "production") {
  //   sendProdError(err, res);
  // }
};
