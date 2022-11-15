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
        camera_distance: 30,
        camera_height: 100
    };

    canvas.height = render.height;
    canvas.width = render.width;

    console.log("Canvas is done");

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

        getContext: function(){
            return context;
        },

        getCanvas: function(){
            return canvas;
        },

        getParams: function(){
            return render;
        },

        setParam: function(){
            //not finished yet
        }
    }
}
());

export default gameCanvas;




