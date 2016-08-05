$(document).ready(function() {
    // lazy load images
    image = document.getElementById("screen");
    image.addEventListener('click', function() {
        $('.ui.modal').modal('show');
    });
    image = document.getElementById("modal");
    image.addEventListener('click', function() {
        $('.ui.modal').modal('hide');
    });
});