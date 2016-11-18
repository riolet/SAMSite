$(document).ready(function() {

    // enable image popups
    var tabs = document.getElementById("tabs");
    var images = tabs.getElementsByTagName("IMG");
    var i = images.length - 1;
    while (i >= 0) {
        images[i].onclick = function () {
            $('.ui.image.modal').modal('show');
        };
        i -= 1;
    }

    //make modal closeable
    var modal = document.getElementById("imageviewer");
    modal.addEventListener('click', function() {
        $('.ui.image.modal').modal('hide');
    });

    //activate tabs
    $('.menu .item').tab({
        onLoad: function (tabName) {
            var img = document.getElementById("scr_" + tabName);
            var mi = document.getElementById("modal_image");
            mi.src = img.src;
        }
    });
});