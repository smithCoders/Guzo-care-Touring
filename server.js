const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./src/configs/.env" });
// N.B we  only require app  file  ater we  finished  configuring the  environment variables.
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require("./app");
// connect  mongose
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    // useCreateIndex: true,
  })
  .then((conn) => {
    console.log("MongoDB connected sucessfully");
  });
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
