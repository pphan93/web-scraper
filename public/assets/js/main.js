$("a#scrape").click(function (e) {
    e.preventDefault();
    // write your code
    console.log("test")
    $.get(
        "/scrape",
        function (data) {
            var $errorMsg = $("#alertMsg").addClass("alert alert-info text-center").text(data);
            setTimeout(function () {
                $errorMsg.removeClass("alert alert-info").empty();
                window.location.replace("/");
            }, 2000)
        });
});

$("a.postLink").click(function (e) {
    e.preventDefault();
    // write your code
    //console.log($(this).data("id"))

    var id = $(this).data("id")



    // Create an object for the user"s data
    var userData = {
        id: $(this).data("id")
    };

    console.log(userData)

    window.location=("/post?id="+id);
});

$("a.saveArticle").click(function (e) {
    e.preventDefault();
    // write your code
    console.log("save")

    var condition = $(this).attr("id")

    var userData = {
        id: $(this).data("id")
    };


    if (condition === "save") {
        userData.condition = 1
        $.post("/save",userData, function(data) {
            window.location.replace("/");
        }) 
    } else {
        userData.condition = 0
        $.post("/save",userData, function(data) {
            window.location.replace("/saved");
        }) 
    }


    // $.get(
    //     "/scrape",
    //     function (data) {
    //         var $errorMsg = $("#alertMsg").addClass("alert alert-info text-center").text(data);
    //         setTimeout(function () {
    //             $errorMsg.removeClass("alert alert-info").empty();
    //             window.location.replace("/");
    //         }, 2000)
    //     });
});