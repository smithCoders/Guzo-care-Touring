const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/natours-api", {
  useNewUrlParser: true,
  useCreateIndex: true,
});
