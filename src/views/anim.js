import gameCanvas from "../models/gameCanvas";
import Filter from "./filter";

var Anim = (function(){

    var context = gameCanvas.getContext();
    var canvas = gameCanvas.getCanvas();

    const offscreenContext = gameCanvas.getOffscreenContext();

    var fixFadeArray = [];

    var glitchingElement;
    var glitchedElemet;

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














    //create a random integer
    const getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }


    const glitch = function(element = null){

        if (element == null) {
            console.log("something");
            return false;
        } else {
        //lemsáoljuk a képet és beállítjuk a parmétereket
        var sourceScreenImage = new Image();
        sourceScreenImage = canvas.toDataURL("image/png", 1.0);
        var elementX, elementY, elementWidth, elementHeight;

        var glitchImageA;
        var glitchImageB;
        var finalImageData;

        if(element.type == 'button' || element.type == 'text'){
            elementX         = element.x;
            elementY         = element.y;
            elementWidth     = context.measureText(element.text).width + 2 * (element.fontSize / 10);
            elementHeight    = element.fontSize;
            } else {
            elementX         = element.x;
            elementY         = element.y;
            elementWidth     = element.width;
            elementHeight    = element.height;
        } 
        
        var randHeight = getRandomInt(1, elementHeight);
        var randHorizontal = getRandomInt(1, 20);

        var finalGlitchedImageX = elementX;
        var finalGlitchedImageY = elementY;
        var finalGlitchedImageW = elementWidth;
        var finalGlitchedImageH = elementHeight;

        var imageData;

        //az element álltal elfoglalt területen végigmegyünk 5x, a terület megegyezik az element álltal elfoglalt paraméterekkel
        for (var i = 0; i < 6; i++) {
            //minden egyes ciklusban a terület xy-ából kiindulva egy véletlenszerű (0 és a terület magassága között)
                //magasságban és a terület szélességében kimásolunk egy részletet a képből

                imageData = context.getImageData(elementX, elementY, elementWidth, randHeight);
                glitchImageA = imageData;
                //glitchImageB = imageData;

                //context.putImageData(glitchImageA, finalGlitchedImageX, finalGlitchedImageY, finalGlitchedImageW, finalGlitchedImageH, 0, 0, finalGlitchedImageW, finalGlitchedImageH); 

            // a kimásolt kép színét módosítjuk A módon és eltoljuk balra random mértékben 
                //(előre meghatározzuk hogy mi az az értéktartomány amiben mozgunk ezt nevezzük TARTOMÁNYnak)


            // a kimásolt kép színét módosítjuk B módon és eltoljuk jobbra random mértékben 
                //(előre meghatározzuk hogy mi az az értéktartomány amiben mozgunk ezt nevezzük TARTOMÁNYnak)


            //még ebben a ciklusban visszaillesztjük ezt a 2 két kép részletet
            offscreenContext.putImageData(glitchImageA, 0, 0, glitchImageA.width, glitchImageA.height, elementX - randHorizontal, elementY, glitchImageA.width, glitchImageA.height);
            //offscreenContext.putImageData(glitchImageB, 0, 0, glitchImageB.width, glitchImageB.height, elementX + randHorizontal, elementY, glitchImageB.width, glitchImageB.height);
            //var finalImageData = offscreenContext.getImageData(finalGlitchedImageX, finalGlitchedImageY, finalGlitchedImageW, finalGlitchedImageH);
            finalImageData = offscreenContext.getImageData(0, 0, 900, 700);
            finalImageData.tagName = getRandomInt(1,40);
        }
        //kimásoljuk a másolt kép egy területét és visszaírjuk a helyére az eredeti screenen
            context.putImageData(imageData, 0, 0, finalGlitchedImageW, finalGlitchedImageH, finalGlitchedImageX, finalGlitchedImageY, finalGlitchedImageW, finalGlitchedImageH); 
            finalImageData = null;
            glitchingElement = null;  
            return finalImageData;
        }
    }

    function framing(imageData, color = "black") {
        return imageData;
    }

    return {
        dialogueFade: function(fadeArray){
            return dialogueFade(fadeArray);
        },

        glitch: function(element){
            return glitch(element);
        },

        framing: function(imageData){
            return framing(imageData);
        },

        }
    }
());

export default Anim;