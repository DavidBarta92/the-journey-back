import gameCanvas from "./gameCanvas.js";
import RenderManager from "../controllers/renderManager.js";
import stateManager from "../controllers/stateManager.js";
import { player } from "./player.js";
import inputController from "../controllers/inputController.js";
import {tree, rock, cross, background } from "./sprites.js";
import Filter from "../views/filter.js";
import dataController from "../controllers/dataController.js";
import Timer from "./timer.js";
import Draw from "./draw.js";

var backgroundImage = new Image();
var textImage = new Image();
var spritesheet = new Image();
var hud = new Image();
var currentDialogueImage = new Image();
var contentContainer;

export const Slide = (function(){
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

    var keys = [];
    var render;

    var gameInterval;
    var absoluteIndex = 0;
    var baseOffset = 0;
    var currentDialogueText;
    var roadParam;

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
        
        contentContainer = dataController.loadContent(state);
        spritesheet.src = contentContainer.spritesPath;
        backgroundImage.src = contentContainer.backgroundPath;
        textImage.src = contentContainer.textPath;
        hud.src = contentContainer.hud;

        if(contentContainer.hasOwnProperty('cursor') && !contentContainer.cursor) document.body.style.cursor = 'none';
    };

    //renders one frame
    const renderGameFrame = function(){
        // Wait for 41 ms to maintain 24 fps
        Timer.wait(41);
        keys = inputController.getKeys();

        gameCanvas.clear();
        const delta = player.updateCarState(baseOffset);
        handleSpeedAndPosition(keys, delta);

        Draw.drawBackground(+((player.posx)*3.5),backgroundImage);

        //dithetring
        var ctxForDither = context.getImageData(0, 0, canvas.width, render.height);
        var ctxFromD = Filter.dither(ctxForDither, ditherParams);
        context.putImageData(ctxFromD, 0, 0);

        Draw.drawSlideText(+((player.posx)*10),textImage);
 
        // Draw.renderHUD(hud, contentContainer, startTime, player, absoluteIndex, currentDialogueImage, currentDialogueText, roadParam, render);
        // drawElements(contentContainer.elements);
    }

    ///////////////////////////////////////////////////////////////////////
      
    const handleSpeedAndPosition = function(keys, delta) {
        if (keys[37]) {
          player.speed += player.acceleration;
        } else if (keys[38]) {
          player.speed -= player.breaking;
        } else {
          player.speed -= player.deceleration;
        }
      
        player.speed = Math.max(0, player.speed); // Cannot go in reverse
        player.speed = Math.min(player.speed, player.maxSpeed); // Maximum speed
      
        carMoving(keys, delta);
    }
      
    const carMoving = function(keys, delta) {
        if (keys[37] && player.speed > 0) {
          player.posx -= 2*player.speed;
        }
    }

    const setState = function(){
        if (contentContainer.end.actionType === "setToClickView") {
            stateManager.setView('story');
            stateManager.setContent(contentContainer.end.action);
            gameCanvas.clear();
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

                    Draw.writeText(element[1], (element[1].x + element[1].textBoxEnd));
                    
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
        });

    }

    const exit = function() {
        clearInterval(gameInterval);
        stateManager.setView('menu');
        stateManager.setContent('main');
        RenderManager.render();
    }
    
    return {
        start: function(state){
            var state = state;
            init(state);
            if (!pause){
                gameInterval = setInterval(renderGameFrame, 1);
            } else {
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