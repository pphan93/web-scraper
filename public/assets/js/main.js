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
            }, 2000)
        });
});
