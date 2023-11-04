import gameCanvas from "./gameCanvas";
import RenderManager from "../controllers/renderManager";
import stateManager from "../controllers/stateManager";
import { player } from "./player.js";
import inputController from "../controllers/inputController.js";
import {tree, rock, cross, background } from "./sprites.js";
import Filter from "../views/filter";
import desert from "../views/driver/desert.json";
import Anim from "../views/anim";
import dataController from "../controllers/dataController";
import Timer from "./timer";

var dialogueOptionClicked;
var backgroundImage = new Image();
var spritesheet = new Image();
var hud = new Image();
var currentDialogueImage = new Image();
var newSpeechIndex;
var contentContainer;
var languageFile;
var dialogueFile;
var spokenSpeeches = [];
var interactives;

var requestNewFrame = false;

export const Driver = (function(){
    var pause = false;

    let ditherParams = {
        greyscaleMethod: false,
        replaceColours: true,
        replaceColourMap: {
            black: {
                r: 10,
                g: 0,
                b: 32,
                a: 0,
            },
            white: {
                r: 0,
                g: 133,
                b: 120,
                a: 255,
            },
        }
    }

    var state = state;
    var canvas;
    var context;

    var r = Math.random;

    // -----------------------------
    // ---  closure scoped vars  ---
    // -----------------------------
    var startTime = new Date();
    var lastDelta = 0;
    var currentTimeString = "";

    var roadParam = {
        maxHeight: 900,
        maxCurve:  700,
        length:    8,
        curvy:     0.9,
        mountainy: 0.8,
        zoneSize:  80
    }

    var road = [];
    var roadSegmentSize = 5;
    var numberOfSegmentPerColor = 4;
    var keys = [];
    var render;
    let cursor = inputController.getCursor();
    var driverViewIndexParams;

    var gameInterval;
    var absoluteIndex = 0;
    var baseOffset = 0;
    var currentDialogueText;

    // -----------------------------
    // -- closure scoped function --
    // -----------------------------

    //initialize the game
    const init = function(state){
        // configure canvas
        canvas = gameCanvas.getCanvas();
        context = gameCanvas.getContext();

        
        canvas.height = canvas.height;
        canvas.width = canvas.width;

        gameCanvas.resize();

        render = {
            width: canvas.width*0.8,
            height: canvas.height*0.8,
            depthOfField: 150,
            camera_distance: 30,
            camera_height: 150
        };
        interactives = {};
        contentContainer = desert;
        spritesheet.src = contentContainer.spritesPath;
        backgroundImage.src = contentContainer.backgroundPath;
        hud.src = "../src/media/images/drive.png";
        languageFile = dataController.loadLanguageFile(state);
        dialogueFile = dataController.loadDialogue(contentContainer.dialogue);
        newSpeechIndex = '1';
    };

    //renders one frame
    const renderGameFrame = function(){
        // Wait for 41 ms to maintain 24 fps
        Timer.wait(41);
        keys = inputController.getKeys();

        gameCanvas.clear();
        console.log(absoluteIndex);
        if (keys[27]) setPause(driverViewIndexParams);

        const delta = player.updateCarState(baseOffset);
        handleSpeedAndPosition(keys, delta);

        drawBackground(-player.posx);
        
        renderRoad();
 
        renderHUD();

        Anim.crt();
        requestNewFrame = true;
    }

    ///////////////////////////////////////////////////////////////////////
      
    const handleSpeedAndPosition = function(keys, delta) {
        if (keys[38]) {
          player.speed += player.acceleration;
        } else if (keys[40]) {
          player.speed -= player.breaking;
        } else if (keys[49] || keys[50]) {
          handleDialogueOptionClick(keys);
        } else {
          player.speed -= player.deceleration;
        }
      
        player.speed = Math.max(0, player.speed); // Cannot go in reverse
        player.speed = Math.min(player.speed, player.maxSpeed); // Maximum speed
        player.position += player.speed;
      
        handleCarTurning(keys, delta);
      }
      
    const handleDialogueOptionClick = function(keys) {
        if (keys[49]) {
          newSpeechIndex = newSpeechIndex + "-1";
        } else if (keys[50]) {
          newSpeechIndex = newSpeechIndex + "-2";
        }
      
        contentContainer.elements.dialogue.processed = false;
        deleteDialogueElements();
        dialogueOptionClicked = true;
      }
      
    const handleCarTurning = function(keys, delta) {
        if (keys[37] && player.speed > 0) {
          player.posx -= player.turning;
        } else if (keys[39] && player.speed > 0) {
          player.posx += player.turning;
        }
      }

    // --------------------------
    // --   Render the road    --
    // --------------------------
    const renderRoad = function(){
        var spriteBuffer = [];
        var holoSpriteBuffer = [];

        absoluteIndex = Math.floor(player.position / roadSegmentSize);
        
        setActionByAbsoluteIndex();

        var currentSegmentIndex    = (absoluteIndex - 2) % road.length;
        var currentSegmentPosition = (absoluteIndex - 2) * roadSegmentSize - player.position;
        var currentSegment         = road[currentSegmentIndex];
        
        var lastProjectedHeight     = Number.POSITIVE_INFINITY;
        var probedDepth             = 0;
        var counter                 = absoluteIndex % (2 * numberOfSegmentPerColor); // for alternating color band
        
        var playerPosSegmentHeight     = road[absoluteIndex % road.length].height;
        var playerPosNextSegmentHeight = road[(absoluteIndex + 1) % road.length].height;
        var playerPosRelative          = (player.position % roadSegmentSize) / roadSegmentSize;
        var playerHeight               = render.camera_height + playerPosSegmentHeight + (playerPosNextSegmentHeight - playerPosSegmentHeight) * playerPosRelative;
        
        baseOffset                 =  currentSegment.curve + (road[(currentSegmentIndex + 1) % road.length].curve - currentSegment.curve) * playerPosRelative;
        
        lastDelta = player.posx - baseOffset*2;
        
        var iter = render.depthOfField;

        while (iter--) {
            var nextSegmentIndex, nextSegment, startProjectedHeight, startScaling, endProjectedHeight, endScaling, currentHeight, currentScaling;

            // Next Segment:
            nextSegmentIndex       = (currentSegmentIndex + 1) % road.length;
            nextSegment            = road[nextSegmentIndex];
            
            startProjectedHeight = Math.floor((playerHeight - currentSegment.height) * render.camera_distance / (render.camera_distance + currentSegmentPosition));
            startScaling         = 30 / (render.camera_distance + currentSegmentPosition);
        
            endProjectedHeight   = Math.floor((playerHeight - nextSegment.height) * render.camera_distance / (render.camera_distance + currentSegmentPosition + roadSegmentSize));
            endScaling           = 30 / (render.camera_distance + currentSegmentPosition + roadSegmentSize);

            currentHeight        = Math.min(lastProjectedHeight, startProjectedHeight);
            currentScaling       = startScaling;
            
            if(currentHeight > endProjectedHeight){
                drawSegment(
                    render.height / 2 + currentHeight, 
                    currentScaling, currentSegment.curve - baseOffset - lastDelta * currentScaling, 
                    render.height / 2 + endProjectedHeight, 
                    endScaling, 
                    nextSegment.curve - baseOffset - lastDelta * endScaling, 
                    counter < numberOfSegmentPerColor, currentSegmentIndex == 2 || currentSegmentIndex == (roadParam.length-render.depthOfField));
            }
            if(currentSegment.sprite){
                spriteBuffer.push({
                    y: render.height / 2 + startProjectedHeight, 
                    x: render.width / 2 - currentSegment.sprite.pos * render.width * currentScaling + /* */currentSegment.curve - baseOffset - (player.posx - baseOffset*2) * currentScaling,
                    ymax: render.height / 2 + lastProjectedHeight, 
                    s: 2.5*currentScaling, 
                    i: currentSegment.sprite.type});
            }

            lastProjectedHeight    = currentHeight;
            
            probedDepth            = currentSegmentPosition;

            currentSegmentIndex    = nextSegmentIndex;
            currentSegment         = nextSegment;
            
            currentSegmentPosition += roadSegmentSize;
            
            counter = (counter + 1) % (2 * numberOfSegmentPerColor);
        }
        
        var sprite;

        while(sprite = spriteBuffer.pop()) {
            drawSprite(sprite);
        }

        //dithetring
        var ctxForDither = context.getImageData(0, 0, render.width, render.height);
        var ctxFromD = Filter.dither(ctxForDither, ditherParams);
        context.putImageData(ctxFromD, 0, 0);

        iter = render.depthOfField;

        var holoCurrentSegmentIndex    = (absoluteIndex - 2) % road.length;
        var holoCurrentSegmentPosition = (absoluteIndex - 2) * roadSegmentSize - player.position;
        var holoCurrentSegment         = road[holoCurrentSegmentIndex];
        
        var holoLastProjectedHeight     = Number.POSITIVE_INFINITY;
        var holoProbedDepth             = 0;

        while (iter--) {
            var holoNextSegmentIndex, holoNextSegment, holoStartProjectedHeight, holoStartScaling, holoEndProjectedHeight, holoEndScaling, holoCurrentHeight, holoCurrentScaling;

            // Next Segment:
            holoNextSegmentIndex       = (holoCurrentSegmentIndex + 1) % road.length;
            holoNextSegment            = road[holoNextSegmentIndex];
            
            holoStartProjectedHeight = Math.floor((playerHeight - holoCurrentSegment.height) * render.camera_distance / (render.camera_distance + holoCurrentSegmentPosition));
            holoStartScaling         = 30 / (render.camera_distance + holoCurrentSegmentPosition);
        
            holoEndProjectedHeight   = Math.floor((playerHeight - holoNextSegment.height) * render.camera_distance / (render.camera_distance + holoCurrentSegmentPosition + roadSegmentSize));
            holoEndScaling           = 30 / (render.camera_distance + holoCurrentSegmentPosition + roadSegmentSize);

            holoCurrentHeight        = Math.min(holoLastProjectedHeight, holoStartProjectedHeight);
            holoCurrentScaling       = holoStartScaling;

            if(holoCurrentHeight > holoEndProjectedHeight){
                drawPath(
                    render.height / 2 + holoCurrentHeight, 
                    holoCurrentScaling, holoCurrentSegment.curve - baseOffset - lastDelta * holoCurrentScaling, 
                    render.height / 2 + holoEndProjectedHeight, 
                    holoEndScaling, 
                    holoNextSegment.curve - baseOffset - lastDelta * holoEndScaling, 
                    holoCurrentSegmentIndex == 2 || holoCurrentSegmentIndex == (roadParam.length-render.depthOfField));
                }
                if(holoCurrentSegment.sprite){
                    holoSpriteBuffer.push({
                        y: render.height / 2 + holoStartProjectedHeight, 
                        x: render.width / 2 - holoCurrentSegment.sprite.pos * render.width * holoCurrentScaling + /* */holoCurrentSegment.curve - baseOffset - (player.posx - baseOffset*2) * holoCurrentScaling,
                        ymax: render.height / 2 + holoLastProjectedHeight, 
                        s: 2.5*holoCurrentScaling, 
                        i: holoCurrentSegment.sprite.type});
                }
            holoLastProjectedHeight    = holoCurrentHeight;
            
            holoProbedDepth            = holoCurrentSegmentPosition;

            holoCurrentSegmentIndex    = holoNextSegmentIndex;
            holoCurrentSegment         = holoNextSegment;
            
            holoCurrentSegmentPosition += roadSegmentSize;
        }
        
        var holoSprite;

        while(holoSprite = holoSpriteBuffer.pop()) {
            drawSprite(holoSprite);
        }
    }    

    // --------------------------
    // --     Draw the hud     --
    // --------------------------
    const renderHUD = function(){
        context.drawImage(hud, 0, 0, canvas.width, canvas.height);

        var now = new Date();
        var diff = now.getTime() - startTime.getTime();
        
        var min = Math.floor(diff / 60000);
        
        var sec = Math.floor((diff - min * 60000) / 1000); 
        if(sec < 10) sec = "0" + sec;
        
        var mili = Math.floor(diff - min * 60000 - sec * 1000);
        if(mili < 100) mili = "0" + mili;
        if(mili < 10) mili = "0" + mili;
        
        currentTimeString = ""+min+":"+sec+":"+mili;

        drawString(currentTimeString, {x: 30, y: 500});

        var speed = Math.round((player.speed / player.maxSpeed * 200) / 6 );
        drawString(""+speed+"mph", {x: 30, y: 488});

        var percent = ""+Math.round(absoluteIndex/(roadParam.length-render.depthOfField)*100)+"%";

        drawString(percent,{x: 287, y: 488});

        contentContainer.elements.speedCounter.text = speed + "mph";
        contentContainer.elements.percentCounter.text = percent;

        writeText(contentContainer.elements.speedCounter);
        contentContainer.elements.speedCounter.x = 30;
        contentContainer.elements.speedCounter.y = 550;
        contentContainer.elements.speedCounter.color = "white";
        writeText(contentContainer.elements.speedCounter);
        writeText(contentContainer.elements.percentCounter);

        //draw dialoge things
        currentDialogueImage.src = currentDialogueText.image;
        context.drawImage(currentDialogueImage, 0, 0, canvas.width, canvas.height);
        writeText(currentDialogueText.text, (currentDialogueText.text.x + currentDialogueText.text.textBoxEnd));

        context.beginPath();
        context.lineWidth = "2";
        context.strokeStyle = "#dc3a15";
        context.rect(30, 620, 30, 30);
        context.stroke();
        context.beginPath();
        context.lineWidth = "2";
        context.strokeStyle = "#dc3a15";
        context.rect(750, 620, 30, 30);
        context.stroke();
        context.beginPath();
        context.lineWidth = "3";
        context.strokeStyle = "#dc3a15";
        context.rect(30, 635, 750, 0);
        context.stroke();

        drawElements(contentContainer.elements);
    }

    const setActionByAbsoluteIndex = function(){
        currentDialogueText = getContentsByAbsoluteIndex();
        if(absoluteIndex >= roadParam.length-render.depthOfField-1){
            setState();
        }
    }

    const getContentsByAbsoluteIndex = function(){
        // Check if "elements" and "dialogue" properties exist in the JSON data
        if (contentContainer && contentContainer.elements && contentContainer.elements.dialogue) {
            const dialogue = contentContainer.elements.dialogue;

            // Filter the dialogue contents based on the absoluteIndex
            const filteredContents = Object.keys(dialogue.contents).filter(index => index <= absoluteIndex);

            if (filteredContents.length > 0) {
                // Get the last matching index
                const lastIndex = filteredContents[filteredContents.length - 1];

                // Return the corresponding contents for the last matching index
                return dialogue.contents[lastIndex];
            }
        }
        return null; // Return null if not found
    }

    const setState = function(){
        if (contentContainer.end.actionType === "setToClickView") {
            stateManager.setView('story');
            stateManager.setContent(contentContainer.end.action);
            gameCanvas.clear();
            interactives = {};
            clearInterval(gameInterval);
            RenderManager.render();
            return;
        }
    }

    //draw all visible elements on the view
    const drawElements = function(elements) {
        document.fonts.ready.then(function () {
            Object.entries(elements).forEach(element => {
                if (element[1].type === 'rock') {
                    
                }
                if (element[1].type === 'tree') {
                    
                }
                if (element[1].type === 'button' || element[1].type === 'text'){
                    //if (element[1].hasOwnProperty('buttonKey')) drawPessKey(element[1].buttonKey);

                    writeText(element[1], (element[1].x + element[1].textBoxEnd));
                    
                    //only buttons have border
                    if(element[1].hasOwnProperty('border') && element[1].border){
                        var width = context.measureText(element[1].text).width + 2 * (element[1].fontSize / 10);
                        var buttonTopLeftX = element[1].x - element[1].fontSize / 10;
                        var buttonTopLeftY = element[1].y - element[1].fontSize + element[1].fontSize / 10;
                        context.beginPath();
                        //context.arc(buttonTopLeftX,buttonTopLeftY,element[1].fontSize/2,180,Math.PI, false);
                        context.strokeStyle = element[1].color;
                        context.lineWidth = 2;
                        context.rect(buttonTopLeftX, buttonTopLeftY, width, element[1].fontSize);
                        context.stroke();
                    }
                }
            });
            dialogueOptionClicked = false;
        });

    }

    // delete dialogue elements from interactives or contentContainer list
    const deleteDialogueElements = function() {
        Object.entries(interactives).forEach(element => {
            if (element[0].includes("dial") && !element[0].includes("dialogue")) delete interactives[element[0]];
        });
        Object.entries(contentContainer.elements).forEach(element => {
            if (element[0].includes("dial") && !element[0].includes("dialogue")) delete contentContainer.elements[element[0]];
        });
    }

    const exit = function() {
        clearInterval(gameInterval);
        stateManager.setView('menu');
        stateManager.setContent('main');
        RenderManager.render();
    }

    const setPause = function(driverViewIndexParams) {
        var pState = stateManager.loadState();
        if(pState.view !== 'menu'){
            var dataURL = gameCanvas.getDataURL();
            dataController.saveScreenImage(dataURL);
            pause = true;
            clearInterval(gameInterval);
            stateManager.setStatus(driverViewIndexParams);
            stateManager.setView('menu');
            stateManager.setContent('main');
            RenderManager.render();
        }
    }

    var dialogueFadeArray = [];

    //write the given text in the chosen language
    const writeText = function(element, textBoxX = window.innerWidth){
        dialogueFadeArray = [];
        var fontString;
        var textString;
        fontString          = element.fontSize + "px " + element.font;
        context.beginPath();
        context.font        = fontString;
        context.fillStyle   = element.color;
        Object.entries(languageFile).forEach(label => {
            if (label[0] == element.text){
                textString = label[1]; 
                return;
            }
        });
        if (!(textString == null)) {
            var lineheight = element.fontSize +(element.fontSize /4);
            var currentLineX = element.x;
            var currentLineY = element.y;
            var words = textString.split(' ');

            for (var i = 0; i < words.length; i++) {
                words[i] = words[i] + ' ';
                var currentWordWidth = context.measureText(words[i]).width;
                if (currentLineX + currentWordWidth > textBoxX) {
                    currentLineY = currentLineY + lineheight;
                    currentLineX = element.x;
                }
                context.fillText(words[i], currentLineX, currentLineY);
                if (element.filter === "dialogueFade") {
                    //dialogueFadeArray.push({x: currentLineX, y: currentLineY - context.measureText(words[i]).actualBoundingBoxAscent, w: currentWordWidth, h: element.fontSize, r: 255, g: 255, b:255, a:1});
                    requestNewFrame = Anim.dialogueFade({x: currentLineX, y: currentLineY - context.measureText(words[i]).actualBoundingBoxAscent, w: currentWordWidth, h: element.fontSize, r: 255, g: 255, b:255, a:1});
                }
                currentLineX = currentWordWidth + currentLineX;
            }
            //requestNewFrame = Filter.dialogueFade(dialogueFadeArray);
        } else {
            context.fillText(element.text, element.x, element.y);
        }
    }

    // Drawing primitive
    const drawImage = function(image, x, y, scaleW, scaleH){
        context.drawImage(image, x, 0, image.width, image.height, 0, 0, scaleW*image.width, scaleH*image.height);
    };

    const drawString = function(string, pos) {
        string = string.toUpperCase();
        var cur = pos.x;
        for(var i=0; i < string.length; i++) {
            spritesheet.src = "../src/media/images/spritesheet.high.png";
            context.drawImage(spritesheet, (string.charCodeAt(i) - 32) * 8, 0, 8, 8, cur, pos.y, 8, 8);
            cur += 8;
        }
    }

    const drawTrapez = function(pos1, scale1, offset1, pos2, scale2, offset2, delta1, delta2, color){
        var demiWidth = render.width / 2;

        var grd = context.createLinearGradient(50, 50, 50, 0);
        grd.addColorStop(0, "#dc3a15");
        grd.addColorStop(1, "white");
        
        context.fillStyle = grd;
        context.beginPath();
        context.moveTo(demiWidth + delta1 * render.width * scale1 + offset1, pos1);
        context.lineTo(demiWidth + delta1 * render.width * scale2 + offset2, pos2); 
        context.lineTo(demiWidth + delta2 * render.width * scale2 + offset2, pos2); 
        context.lineTo(demiWidth + delta2 * render.width * scale1 + offset1, pos1);
        context.fill();
    }

    const drawSprite = function(sprite){
        //if(sprite.y <= sprite.ymax){
            var destY = sprite.y - sprite.i.h * sprite.s;
            if(sprite.ymax < sprite.y) {
                var h = Math.min(sprite.i.h * (sprite.ymax - destY) / (sprite.i.h * sprite.s), sprite.i.h);
            } else {
                var h = sprite.i.h; 
            }
            //sprite.y - sprite.i.h * sprite.s
            spritesheet.src = "../src/media/images/images/spritesheet.high.png";
            if(h > 0) context.drawImage(spritesheet,  sprite.i.x, sprite.i.y, sprite.i.w, h, sprite.x, destY, sprite.s * sprite.i.w, sprite.s * h);
        //}
    };

    const drawBackground = function(position) {
        var first = position / 20 % (backgroundImage.width);
        drawImage(backgroundImage, first+700, 8, 2.2, 2.2);
    }

    const drawSegment = function (position1, scale1, offset1, position2, scale2, offset2, alternate, finishStart){
        var grass     = (alternate) ? "#A89A72" : "#B5A67B";

        //draw ground:
        context.fillStyle = grass;
        context.fillRect(0,position2,render.width,(position1-position2));
    }

    const drawPath = function (position1, scale1, offset1, position2, scale2, offset2, alternate, finishStart){
        var border    = (alternate) ? "#4842f5" : "#4842f5";
        var road      = (alternate) ? "#eda" : "#dc9";
        var lane      = (alternate) ? "#4842f5" : "#dc9";

        if(finishStart){
            road = "#fff";
            lane = "#fff";
            border = "#fff";
        }

        // draw the road
        //drawTrapez(position1, scale1, offset1, position2, scale2, offset2, -0.5, 0.5, road);
        
        //draw the road border
        drawTrapez(position1, scale1, offset1, position2, scale2, offset2, -0.5, -0.47, border);
        drawTrapez(position1, scale1, offset1, position2, scale2, offset2, 0.47,   0.5, border);
        
        // draw the lane line
        drawTrapez(position1, scale1, offset1, position2, scale2, offset2, -0.18, -0.15, lane);
        drawTrapez(position1, scale1, offset1, position2, scale2, offset2,  0.15,  0.18, lane);
    }

    //used to triggering animation frame by render game frame
    const triggering = function(){
        if(requestNewFrame || context.globalAlpha <= 0.9 || dialogueOptionClicked){
            requestNewFrame = false;
            return true;
        } else {
            return false;
        }
    }

    // -------------------------------------
    // ---  Generates the road randomly  ---
    // -------------------------------------
    const generateRoad = function(){
        var currentStateH = 0; //0=flat 1=up 2= down
        var transitionH = [[0,1,2],[0,2,2],[0,1,1]];
        
        var currentStateC = 0; //0=straight 1=left 2= right
        var transitionC = [[0,1,2],[0,2,2],[0,1,1]];

        var currentHeight = 0;
        var currentCurve  = 0;

        var zones     = roadParam.length;
        while(zones--){
            // Generate current Zone
            var finalHeight;
            switch(currentStateH){
                case 0:
                    finalHeight = 0; break;
                case 1:
                    finalHeight = roadParam.maxHeight * r(); break;
                case 2:
                    finalHeight = - roadParam.maxHeight * r(); break;
            }
            var finalCurve;
            switch(currentStateC){
                case 0:
                    finalCurve = 0; break;
                case 1:
                    finalCurve = - roadParam.maxCurve * r(); break;
                case 2:
                    finalCurve = roadParam.maxCurve * r(); break;
            }

            for(var i=0; i < roadParam.zoneSize; i++){
                // add a tree
                if(i % roadParam.zoneSize / 4 == 0){
                    var sprite = {type: rock, pos: -0.55};
                } else {
                    if(r() < 0.05) {
                        var spriteType = tree;//([tree,rock])[Math.floor(r()*1.9)];
                        var sprite = {type: spriteType, pos: 0.6 + 4*r()};
                        if(r() < 0.5){
                            sprite.pos = -sprite.pos;
                        }
                    } else {
                        var sprite = false;
                    }
                }
                road.push({
                    height: currentHeight+finalHeight / 2 * (1 + Math.sin(i/roadParam.zoneSize * Math.PI-Math.PI/2)),
                    curve: currentCurve+finalCurve / 2 * (1 + Math.sin(i/roadParam.zoneSize * Math.PI-Math.PI/2)),
                    sprite: sprite
                })
            }
            currentHeight += finalHeight;
            currentCurve += finalCurve;
            // Find next zone
            if(r() < roadParam.mountainy){
                currentStateH = transitionH[currentStateH][1+Math.round(r())];
            } else {
                currentStateH = transitionH[currentStateH][0];
            }
            if(r() < roadParam.curvy){
                currentStateC = transitionC[currentStateC][1+Math.round(r())];
            } else {
                currentStateC = transitionC[currentStateC][0];
            }
        }
        roadParam.length = roadParam.length * roadParam.zoneSize;

    };
    
    return {
        start: function(state){
            var state = state;
            init(state);
            if (!pause){
                gameInterval = setInterval(renderGameFrame, 1);
                generateRoad();
            } else {
                generateRoad();
                gameInterval = setInterval(renderGameFrame, 1);
            }
        },
        exit: function(){
            exit();
        },
        updateCarState: function(){
            player.updateCarState(lastDelta);
        }
    }
}
());

export const Driver2 = (function(){
    const init = function(state){

    }

    //render one frame of the menu
    const renderMenuFrame = function(){

    }

    //tracking cursor
    const trackInput = function(){

    }

    const trackAnimation = function(){

    }

    return {
        render: function(state){

            },

        //its only for th first screen rendering at the game starting (this preload pictures, fonts for the clickview)
        preRender: function(state){

            }
        }
    }
());

//export default Driver;