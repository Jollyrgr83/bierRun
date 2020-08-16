// SERVER
// dependencies
const express = require("express");
const mongoose = require("mongoose");
// set up express router
const app = express();
// bring in routes
const routes = require("./routes");
// establish port variable
const PORT = process.env.PORT || 3001;
// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
// routes
app.use(routes);
// mongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://user:password1@ds361768.mlab.com:61768/heroku_s62dvl7k" || "mongodb://localhost/bierRunDB");
// starts API server
app.listen(PORT, function() {
  console.log(`API Server now listening on PORT ${PORT}`);
});
