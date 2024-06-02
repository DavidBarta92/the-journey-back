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
        camera_height: 150
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

    function chromaticAbberation() {
        var mRed = document.getElementById('mRed');
        var fered = document.getElementById('fered');
        var mBlue = document.getElementById('mBlue');
        var feblue = document.getElementById('feblue');

        var colorMatrixRed = ['1.2 0 0 0 0 0 0.15 0 0 0 0 0 0.15 0 0 0 0 0 1 0','1.5 0 0 0 0 0 0.15 0 0 0 0 0 0.15 0 0 0 0 0 1 0'];
        var randomIndex = Math.floor(Math.random() * colorMatrixRed.length);
        
        mRed.setAttribute('values', colorMatrixRed[randomIndex]);
        fered.setAttribute('dx', getRandomBetween(-1, 2));
        
        var colorMatrixBlue = ['0.15 0 0 0 0 0 1.2 0 0 0 0 0 1.2 0 0 0 0 0 1 0','0.15 0 0 0 0 0 1.5 0 0 0 0 0 1.5 0 0 0 0 0 1 0'];
        var randomIndex = Math.floor(Math.random() * colorMatrixBlue.length);
        
        mBlue.setAttribute('values', colorMatrixBlue[randomIndex]);
        feblue.setAttribute('dx', getRandomBetween(-1, 2));
        var randomTime = Math.floor((Math.random() * 1000)*2);
        setTimeout(resetChanges, randomTime);
      }
    
      function resetChanges() {
        var mRed = document.getElementById('mRed');
        var fered = document.getElementById('fered');
        var mBlue = document.getElementById('mBlue');
        var feblue = document.getElementById('feblue');
    
        // Set the original colors
        mRed.setAttribute('values', '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0');
        fered.setAttribute('dx', '0');
    
        mBlue.setAttribute('values', '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0');
        feblue.setAttribute('dx', '0');
      }
    
      function getRandomBetween(min, max) {
        return Math.random() * (max - min) + min;
      }

      setInterval(chromaticAbberation, getRandomBetween(100, 50000));

    return {
        resize: function(){
            var scale;
            if (window.innerWidth / window.innerHeight > render.width / render.height) {
                scale = window.innerHeight / render.height;
            }
            else {
                scale = window.innerWidth / render.width;
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




