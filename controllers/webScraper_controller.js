var express = require("express");
var router = express.Router();

// var mongojs = require("mongojs");
var mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/populatedb", {
    useNewUrlParser: true
});

// // Database configuration
// var databaseUrl = "scraper";
// var collections = ["scrapedData"];



// Require all models
var db = require("../models");

// // Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function (error) {
//     console.log("Database Error:", error);
// });

// Main route (simple Hello World Message)
router.get("/", function (req, res) {
    //console.log("hello")
    // Find all results from the scrapedData collection in the db
    db.Article.find(function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            //res.json(found);

            //console.log(found)
            res.render("index", {
                found: found
            });
        }
    });


});

// Retrieve data from the db
router.get("/all", function (req, res) {
    // Find all results from the scrapedData collection in the db
    db.Article.find(function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            console.log("hello")
            res.json(found);
        }
    });
});

router.get("/:id", function (req, res) {

    var postId = req.params.id;


    db.Article.findById(postId, function (error, found) {

        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            console.log(found)
            //res.json(found);

            var result = found

            axios.get(result.link).then(function (response) {
                // Load the html body from axios into cheerio
                var $ = cheerio.load(response.data);
                $("#articlebody").each(function (i, element) {
                    console.log($(element).html())
                    result.html = $(element).html()
                    res.render("post",result
                    )
                });
        
            })
        }
    });



});

// Scrape data from one site and place it into the mongodb db
router.get("/scrape", function (req, res) {
    axios.get("https://thehackernews.com/").then(function (response) {
        // Load the html body from axios into cheerio
        var $ = cheerio.load(response.data);
        $(".body-post").each(function (i, element) {
            var title = $(element).find(".home-title").text()
            var link = $(element).children("a").attr("href");
            var img = $(element).find(".home-img").find("img").attr('data-src')
            var desc = $(element).find(".home-desc").text()
            var date = $(element).find(".item-label").clone() //clone the element
                .children() //select all the children
                .remove() //remove all the children
                .end() //again go back to selected element
                .text();

            var author = $(element).find(".item-label").find("span").clone() //clone the element
                .children() //select all the children
                .remove() //remove all the children
                .end() //again go back to selected element
                .text();

            //console.log(author)

            // If this found element had both a title and a link
            if (title && link) {
                // Insert the data in the scrapedData db
                db.Article.create({
                        title: title,
                        link: link,
                        img: img,
                        desc: desc,
                        date: date,
                        author: author
                    },
                    function (err, inserted) {
                        if (err) {
                            // Log the error if one is encountered during the query
                            console.log(err);
                        } else {
                            // Otherwise, log the inserted data
                            console.log(inserted);
                        }
                    });
            }
        });
    });

    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
});

// Export routes for server.js to use.
module.exports = router;