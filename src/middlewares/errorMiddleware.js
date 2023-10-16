const errorHandler = (err, req, res, next) => {
  // Log the error for debugging purposes
  console.log(err.message);

  // Set a default error status code and message
  let statusCode = 500;
  let message = "Internal Server Error";

  // Check if the error is a known error type and update the status code and message accordingly
  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof SyntaxError) {
    statusCode = 400;
    message = "Invalid JSON payload";
  } else if (err instanceof ValidationError) {
    statusCode = 422;
    message = err.message;
  }

  // Send the error response to the client
  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
