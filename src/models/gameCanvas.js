var gameCanvas = (function(){

    var canvas;
    var context;

    // configure canvas
    canvas = document.getElementById("c");
    context = canvas.getContext('2d');

    //set render params
    var render = {
        width: 1280,
        height: 720,
        depthOfField: 150,
        camera_distance: 40,
        camera_height: 200
    };

    canvas.height = render.height;
    canvas.width = render.width;

    const offscreenCanvas = new OffscreenCanvas(render.width, render.height);
    const offscreenContext = offscreenCanvas.getContext('2d');

    function offset(el) {
        var box = el.getBoundingClientRect();
        var docElem = document.documentElement;
        return {
          top: box.top + window.pageYOffset - docElem.clientTop,
          left: box.left + window.pageXOffset - docElem.clientLeft
        };
    }

    return {
        resize: function(){
            if (window.innerWidth / window.innerHeight > render.width / render.height) {
                var scale = window.innerHeight / render.height;
            }
            else {
                var scale = window.innerWidth / render.width;
            }
            
            var transform = "scale(" + scale + ")";
            var c =  document.getElementById("c");
            
            c.style.MozTransform = transform;
            c.style.transform = transform;
            c.style.webkitTransform = transform;
            c.style.top = ((scale - 1) * render.height / 2) + "px";
            c.style.left = ((scale - 1) * render.width / 2 + (window.innerWidth - render.width * scale) / 2) + "px";
        },

        clear: function(){
            context.clearRect(0, 0, canvas.width, canvas.height);
        },

        canvasOffset: function(){
            return offset(canvas);
        },

        getContext: function(){
            return context;
        },

        getCanvas: function(){
            return canvas;
        },

        getDataURL: function(){
            var dataURL = canvas.toDataURL();
            return dataURL;
        },

        getParams: function(){
            return render;
        },

        setParam: function(){
            //not finished yet
        },

        getOffscreenContext: function(){
            return offscreenContext;
        },

        getOffscreenCanvas: function(){
            return offscreenCanvas;
        },

        clearOffscreenCanvas: function(){
            offscreenContext.clearRect(0, 0, canvas.width, canvas.height);
        },
    }
}
());

export default gameCanvas;




