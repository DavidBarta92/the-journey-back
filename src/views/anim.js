import gameCanvas from "../models/gameCanvas";

var Anim = (function(){

    var context = gameCanvas.getContext();

    var render = gameCanvas.getParams();
    const offscreen = new OffscreenCanvas(render.width, render.height);
    const ctx = offscreen.getContext('2d');

    var fixFadeArray = [];

    //got a fadearray includes color rects to cover texts at the begining
    //every time when you call this function it draws the rect but with 10% less opacitiy 
    function dialogueFade(fadeRect) {
        var adding = false;
        var needsNewAnimFrame = false;
        if (!(fixFadeArray.length == 0)) {
            for (var i = 0; i < fixFadeArray.length; i++) {
                if (fixFadeArray[i].x == fadeRect.x 
                    && fixFadeArray[i].y == fadeRect.y 
                    && fixFadeArray[i].w == fadeRect.w 
                    && fixFadeArray[i].h == fadeRect.h) {
                        return;
                } else {
                    adding = true;
                }
                if (adding) {
                    console.log(adding);
                    fixFadeArray.push(fadeRect);
                }
            }
        } else {
            adding = true;
            fixFadeArray.push(fadeRect);
        }
        console.log(fixFadeArray);
        for (var i = 0; i < fixFadeArray.length; i++) {
            context.fillStyle = "rgba(" + fixFadeArray[i].r + "," + fixFadeArray[i].g + "," + fixFadeArray[i].b + "," + fixFadeArray[i].a + ")";
            context.fillRect(fixFadeArray[i].x, fixFadeArray[i].y, fixFadeArray[i].w, fixFadeArray[i].h);
            if (fixFadeArray[i].a > 0) {
                fixFadeArray[i].a = (fixFadeArray[i].a * 10 - 0.1 * 10) / 10;
                needsNewAnimFrame = true;
            }
        }
        console.log(needsNewAnimFrame);
        if (!needsNewAnimFrame) {
            fixFadeArray = [];
        }
        return needsNewAnimFrame;
    }






















    const glitch = function(element){
        imageObjShadow.onload = function(){
            var arr = lineShadowsHeight(element);
            var sy = 0;

            for (var i = 0; i < arr.length; i++){
                //context.drawImage(this, 0, sy, canvas.width, arr[i], getRandomInt(-2*offset(), 2*offset()), sy, canvas.width, arr[i]);
                sy = sy + arr[i];
            }
        }
    }

    function drawText(){
        context.font = "normal 80px Roboto Condensed";
        context.fillStyle = "#FFFFFF";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, xPosition, yPosition);
    }
      
    function getRandomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
      
    var lineShadows = function (){
        return Math.floor(Math.random() * (7 - 4 + 1) + 4);
    };
      
    var offset = function(){
        return Math.floor(Math.random() * (3 - 2 + 1) + 2)*0.8;
    }
      
    var timeBack = function (){
        var max = 300;
        var min = 80;
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
      
    var lineShadowsHeight = function (element){
        var h = element.fontSize;
        var count =lineShadows();
        var arr = [];
        var s = 0;
        
        for (var i = 0; i < count; i++)
          {
             arr[i] = Math.floor(Math.random() * (h/(count-1)- 2 + 1) + 2);
             h = h -  arr[i];
             s = s + arr[i];
             arr[count] = canvas.height - s;
          }
          return arr;
    }
      
    function getShadowsImg(){
        context.save();
        context.font = "bold 80px Roboto Condensed";    
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.globalCompositeOperation = "destination-over";
        context.clearRect(0,0,canvas.width,canvas.height);
        context.fillStyle = "#a3004a";
        context.fillText(text, xPosition-2, yPosition);
        context.fillStyle = "#09c4de";
        context.fillText(text, xPosition+2, yPosition);
        context.restore(); 
        
        imageDataShadows = canvas.toDataURL("image/png", 1.0);
    }

    return {
        dialogueFade: function(fadeArray){
            return dialogueFade(fadeArray);
        },

        glitch: function(element){
            return glitch(element);
        }

        }
    }
());

export default Anim;