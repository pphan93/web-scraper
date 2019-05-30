// Dependencies
var express = require("express");


// Initialize Express
var app = express();

// Set Handlebars.
var exphbs = require("express-handlebars");

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");



// Import routes and give the server access to them.
var routes = require("./controllers/webScraper_controller.js");

app.use(routes);

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});