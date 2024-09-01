let fullscreen;
let fsEnter = document.getElementById('full-screen');
fsEnter.addEventListener('click', function (e) {
    e.preventDefault();
    if (!fullscreen) {
        fullscreen = true;
        document.documentElement.requestFullscreen();
        } else {
        fullscreen = false;
        document.exitFullscreen();
    }
});
document.addEventListener("fullscreenchange", function() { 
    if((window.fullScreen) || (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
        fullscreen = true;
        } else {
        fullscreen = false;
    }
});  