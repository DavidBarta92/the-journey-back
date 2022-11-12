var gameCanvas = (function(){

    var canvas;
    var context;

    // configure canvas
    canvas = document.getElementById("c");
    context = canvas.getContext('2d');

    //set render params
    var render = {
        width: 320,
        height: 240,
        depthOfField: 150,
        camera_distance: 30,
        camera_height: 100
    };

    console.log("Canvas is done");

    return {
        resize: function(){
            context.height = render.height;
            context.width = render.width;

            if (window.innerWidth / window.innerHeight > render.width / render.height) {
                var scale = window.innerHeight / render.height;
            }
            else {
                var scale = window.innerWidth / render.width;
            }
            
            var transform = "scale(" + scale + ")";
            // document.getElementById("c").css("MozTransform", transform).css("transform", transform).css("WebkitTransform", transform).css({
            //     top: (scale - 1) * render.height / 2,
            //     left: (scale - 1) * render.width / 2 + (window.innerWidth - render.width * scale) / 2
            // });
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




