import gameCanvas from "../models/gameCanvas";
import RenderManager from "../controllers/renderManager";
import stateManager from "../controllers/stateManager";
import { player } from "../models/player.js";
import inputController from "../controllers/inputController.js";
import {tree, rock, background } from "../models/sprites.js";
import Filter from "./filter";

var spritesheet = new Image();
            spritesheet.src = "../media/spritesheet.high.png";

var Racer = (function(){
    var state = state;
    var keys = [];
    var canvas;
    var context;

    var r = Math.random;

    // -----------------------------
    // ---  closure scoped vars  ---
    // -----------------------------
    var context;
    var startTime = new Date();
    var lastDelta = 0;
    var currentTimeString = "";

    var roadParam = {
        maxHeight: 900,
        maxCurve:  400,
        length:    12,
        curvy:     0.8,
        mountainy: 0.8,
        zoneSize:  250
    }

    var road = [];
    var roadSegmentSize = 5;
    var numberOfSegmentPerColor = 4;

    var render = gameCanvas.getParams();

    var splashInterval;
    var gameInterval;

    // -----------------------------
    // -- closure scoped function --
    // -----------------------------

    //initialize the game
    var init = function(){
        // configure canvas
        canvas = gameCanvas.getCanvas();
        context = gameCanvas.getContext();
        
        canvas.height = render.height;
        canvas.width = render.width;
        
        gameCanvas.resize(); 
        
        generateRoad();
    };

    //renders one frame
    var renderGameFrame = function(){

        keys = inputController.getKeys();
        
        gameCanvas.clear();
        
        // Update the car state 
        //player.updateCarState(lastDelta);

        if (Math.abs(lastDelta) > 130){
            if (player.speed > 3) {
                player.speed -= 0.2;
            }
        } else {
            // read acceleration controls
            if (keys[38]) { // 38 up
                //player.position += 0.1;
                player.speed += player.acceleration;
            } else if (keys[40]) { // 40 down
                player.speed -= player.breaking;
            } else {
                player.speed -= player.deceleration;
            }
        }

        player.speed = Math.max(player.speed, 0); //cannot go in reverse
        player.speed = Math.min(player.speed, player.maxSpeed); //maximum speed
        player.position += player.speed;
        
        // car turning
        if (keys[37]) {
            // 37 left
            if(player.speed > 0){
                player.posx -= player.turning;
            }
        } else if (keys[39]) {
            // 39 right
            if(player.speed > 0){
                player.posx += player.turning;
            }
        }

        drawBackground(-player.posx);

        var spriteBuffer = [];
        
        // --------------------------
        // --   Render the road    --
        // --------------------------
        var absoluteIndex = Math.floor(player.position / roadSegmentSize);
        
        if(absoluteIndex >= roadParam.length-render.depthOfField-1){
            clearInterval(gameInterval);
            drawString("You did it!", {x: 100, y: 20});
        }
        
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
        
        var baseOffset                 =  currentSegment.curve + (road[(currentSegmentIndex + 1) % road.length].curve - currentSegment.curve) * playerPosRelative;
        
        lastDelta = player.posx - baseOffset*2;
        
        var iter = render.depthOfField;
        while (iter--) {
            // Next Segment:
            var nextSegmentIndex       = (currentSegmentIndex + 1) % road.length;
            var nextSegment            = road[nextSegmentIndex];
            
            var startProjectedHeight = Math.floor((playerHeight - currentSegment.height) * render.camera_distance / (render.camera_distance + currentSegmentPosition));
            var startScaling         = 30 / (render.camera_distance + currentSegmentPosition);
        
            var endProjectedHeight   = Math.floor((playerHeight - nextSegment.height) * render.camera_distance / (render.camera_distance + currentSegmentPosition + roadSegmentSize));
            var endScaling           = 30 / (render.camera_distance + currentSegmentPosition + roadSegmentSize);

            var currentHeight        = Math.min(lastProjectedHeight, startProjectedHeight);
            var currentScaling       = startScaling;
            
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

        // --------------------------
        // --     Draw the hud     --
        // --------------------------        
        drawString(""+Math.round(absoluteIndex/(roadParam.length-render.depthOfField)*100)+"%",{x: 287, y: 1});
        
        var now = new Date();
        var diff = now.getTime() - startTime.getTime();
        
        var min = Math.floor(diff / 60000);
        
        var sec = Math.floor((diff - min * 60000) / 1000); 
        if(sec < 10) sec = "0" + sec;
        
        var mili = Math.floor(diff - min * 60000 - sec * 1000);
        if(mili < 100) mili = "0" + mili;
        if(mili < 10) mili = "0" + mili;
        
        currentTimeString = ""+min+":"+sec+":"+mili;

        // Create gradient
        var grd = context.createLinearGradient(0,10,100,100);
        grd.addColorStop(0,"#92885B");
        grd.addColorStop(1,"#3B351A");

        // Fill with gradient
        context.fillStyle = grd;
        context.fillRect(0, 620, render.width, 200);
        
        drawString(currentTimeString, {x: 1, y: 1});
        var speed = Math.round(player.speed / player.maxSpeed * 200);
        drawString(""+speed+"mph", {x: 1, y: 10});

        // var ctxForRaindrops = context.getImageData(0, 0, render.width, render.height);
        // var ctxFromRainD = Filter.raindrops(ctxForRaindrops, 1,10, 0.5);
        // context.putImageData(ctxFromRainD, 0, 0);

        var ctxForDither = context.getImageData(0, 0, render.width, render.height);
        var ctxFromD = Filter.dither(ctxForDither);
        context.putImageData(ctxFromD, 0, 0);
    };

    ///////////////////////////////////////////////////////////////////////6

    var exit = function() {
        clearInterval(gameInterval);
        stateManager.setView('menu');
        stateManager.setContent('main');
        RenderManager();
    }

    // Drawing primitive
    var drawImage = function(image, x, y, scale){
        context.drawImage(spritesheet,  image.x, image.y, image.w, image.h, x, y, scale*image.w, scale*image.h);
    };

    var drawString = function(string, pos) {

        string = string.toUpperCase();
        var cur = pos.x;
        for(var i=0; i < string.length; i++) {
            context.drawImage(spritesheet, (string.charCodeAt(i) - 32) * 8, 0, 8, 8, cur, pos.y, 8, 8);
            cur += 8;
        }
    }

    var drawTrapez = function(pos1, scale1, offset1, pos2, scale2, offset2, delta1, delta2, color){
        var demiWidth = render.width / 2;
        
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(demiWidth + delta1 * render.width * scale1 + offset1, pos1);
        context.lineTo(demiWidth + delta1 * render.width * scale2 + offset2, pos2); 
        context.lineTo(demiWidth + delta2 * render.width * scale2 + offset2, pos2); 
        context.lineTo(demiWidth + delta2 * render.width * scale1 + offset1, pos1);
        context.fill();
    }

    var drawSprite = function(sprite){
        //if(sprite.y <= sprite.ymax){
            var destY = sprite.y - sprite.i.h * sprite.s;
            if(sprite.ymax < sprite.y) {
                var h = Math.min(sprite.i.h * (sprite.ymax - destY) / (sprite.i.h * sprite.s), sprite.i.h);
            } else {
                var h = sprite.i.h; 
            }
            //sprite.y - sprite.i.h * sprite.s
            if(h > 0) context.drawImage(spritesheet,  sprite.i.x, sprite.i.y, sprite.i.w, h, sprite.x, destY, sprite.s * sprite.i.w, sprite.s * h);
        //}
    };

    var drawBackground = function(position) {
        var first = position / 2 % (background.w);
        drawImage(background, first-background.w +3, 0, 3);
        drawImage(background, first+background.w -3, 0, 3);
        drawImage(background, first, 0, 3);
    }

    var drawSegment = function (position1, scale1, offset1, position2, scale2, offset2, alternate, finishStart){
        var grass     = (alternate) ? "#eda" : "#dc9";
        var border    = (alternate) ? "#e00" : "#fff";
        var road      = (alternate) ? "#999" : "#777";
        var lane      = (alternate) ? "#fff" : "#777";

        if(finishStart){
            road = "#fff";
            lane = "#fff";
            border = "#fff";
        }

        //draw grass:
        context.fillStyle = grass;
        context.fillRect(0,position2,render.width,(position1-position2));
        
        // draw the road
        drawTrapez(position1, scale1, offset1, position2, scale2, offset2, -0.5, 0.5, road);
        
        //draw the road border
        drawTrapez(position1, scale1, offset1, position2, scale2, offset2, -0.5, -0.47, border);
        drawTrapez(position1, scale1, offset1, position2, scale2, offset2, 0.47,   0.5, border);
        
        // draw the lane line
        drawTrapez(position1, scale1, offset1, position2, scale2, offset2, -0.18, -0.15, lane);
        drawTrapez(position1, scale1, offset1, position2, scale2, offset2,  0.15,  0.18, lane);
    }

    // -------------------------------------
    // ---  Generates the road randomly  ---
    // -------------------------------------
    var generateRoad = function(){
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
            gameInterval = setInterval(renderGameFrame, 60);
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

export default Racer;