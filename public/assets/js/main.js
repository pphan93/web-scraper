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

$("#comment").click(function (e) {
    e.preventDefault();
    // write your code
    console.log("test")

    console.log($("textarea#commentArea").val())


    var userData = {
        id: $(this).data("id"),
        comment: $("textarea#commentArea").val(),
        name: $("#name").val()
    }

    $.post(
        "/comment", userData,
        function (data) {
            console.log(data)
            var comments = data.comments
            outputComment(comments)
        });
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
        $.post("/save", userData, function (data) {
            window.location.replace("/");
        })
    } else {
        userData.condition = 0
        $.post("/save", userData, function (data) {
            window.location.replace("/saved");
        })
    }

});


$(document).on("click","a.removeComment",function (e) {
    e.preventDefault();
    // write your code
    console.log("remove")

    var userData = {
        id: $(this).data("id")
    };


        $.post("/removeComment", userData, function (data) {
            console.log(data)
            var comments = data.comments
            outputComment(comments)
        })
    

});



function outputComment(comments) {

    var commentSection = $("#commentSection")
    commentSection.empty();
    var html;

    for (var i = 0; i < comments.length; i++) {
        var currComment = comments[i].comment
        var date = new Date(comments[i].date).toISOString().replace(/T/, " ").replace(/\..+/, '').replace(/\d\d:\d\d:\d\d/, '')
        var name = comments[i].name
        var id = comments[i]._id
        html = '</br><strong class="pull-left primary-font">' + name + '</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span>'
        html = html + date + '<a class="removeComment float-right" href="#" data-id=' + id + '><i class="fas fa-times"></i></a></small>' + '</small></br><li class="ui-state-default">' + currComment
        html = html + '</li>'
        commentSection.append(html)
    }
}