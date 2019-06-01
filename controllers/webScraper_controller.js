var express = require("express");
var router = express.Router();

// var mongojs = require("mongojs");
var mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/populatedb";
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
});

// Require all models
var db = require("../models");

// Main route (simple Hello World Message)
router.get("/", function (req, res) {
    // Find all results from the scrapedData collection in the db
    db.Article.find({
        saved: 0
    }, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.render("index", {
                found: found
            });
        }
    });
});


router.post("/save", function (req, res) {
    var postId = req.body.id
    var condition = req.body.condition
    console.log(postId)


    db.Article.findByIdAndUpdate(postId, {
        saved: condition
    }, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            console.log("hello")
            res.redirect("/");
        }
    })
})

router.post("/removeComment", function (req, res) {
    db.Note.findOneAndRemove({
        _id: req.body.id
    }, function (err) {
        if (err) throw err;
        db.Article.findOneAndUpdate({
                "comments": req.body.id
            }, {
                "$pull": {
                    "comments": req.body.id
                }
            }, {
                new: true
            },
            function (err, result) {
                if (err) throw err;
                console.log(result)
                db.Article.findOne({
                        _id: result._id
                    })
                    .populate("comments")
                    .then(function (dbArticle) {
                        res.json(dbArticle);
                    })
                    .catch(function (err) {
                        res.json(err);
                    });
            }
        );
    });
})

router.post("/comment", function (req, res) {
    var postId = req.body.id
    var comment = req.body.comment
    var name = req.body.name

    console.log(postId)

    db.Note.create({
            name: name,
            comment: comment
        })
        .then(function (dbNote) {
            console.log(dbNote)
            return db.Article.findOneAndUpdate({
                _id: postId
            }, {
                $push: {
                    comments: dbNote._id
                }
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {


            db.Article.findOne({
                    _id: dbArticle._id
                })
                // Specify that we want to populate the retrieved users with any associated notes
                .populate("comments")
                .then(function (dbArticle) {
                    // If able to successfully find and associate all Users and Notes, send them back to the client
                    res.json(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurs, send it back to the client
                    res.json(err);
                });
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            console.log(err)
            res.json(err);
        });
})

router.get("/saved", function (req, res) {
    db.Article.find({
        saved: 1
    }, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.render("index", {
                found: found
            });
        }
    });
})

router.get("/post", function (req, res) {

    var postId = req.query.id;
    //console.log(postId)

    db.Article.findOne({
            _id: postId
        })
        // Specify that we want to populate the retrieved users with any associated notes
        .populate("comments")
        .then(function (result) {

            console.log(result)

            axios.get(result.link).then(function (response) {
                // Load the html body from axios into cheerio
                var $ = cheerio.load(response.data);
                $("#articlebody").each(function (i, element) {
                    //console.log($(element).html())
                    result.html = $(element).html()
                    res.render("post", result)
                });

            })
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

router.get("/clear", function (req, res) {
    console.log("Test")
    db.Article.deleteMany({}, function (error, result) {

        db.Note.deleteMany({}, function (err, result) {
            res.redirect("/")
        })
    })

})

// Scrape data from one site and place it into the mongodb db
router.get("/scrape", function (req, res) {
    console.log("test")
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

            console.log(author)

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