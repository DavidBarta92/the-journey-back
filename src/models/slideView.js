import gameCanvas from "./gameCanvas.js";
import RenderManager from "../controllers/renderManager.js";
import stateManager from "../controllers/stateManager.js";
import { player } from "./player.js";
import inputController from "../controllers/inputController.js";
import Filter from "../views/filter.js";
import dataController from "../controllers/dataController.js";
import Timer from "./timer.js";
import Draw from "./draw.js";
import Sound from "./sound.js";

const infoImage = new Image();
infoImage.src = "../src/media/images/infobox_keyboard.png";
var backgroundImage = new Image();
var textImage = new Image();
var spritesheet = new Image();
var hud = new Image();
var currentDialogueImage = new Image();
var contentContainer;
var noiseVolume = 0;
var languageFile;

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

    var absoluteIndex = 0;
    var baseOffset = 0;
    var currentDialogueText;
    var roadParam;
    var animationFrameId; 

    // -----------------------------
    // -- closure scoped function --
    // -----------------------------

    const init = function(state){
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
        textImage.src = getImageByLanguage(contentContainer.textPath);
        hud.src = contentContainer.hud;

        if(contentContainer.hasOwnProperty('cursor') && !contentContainer.cursor) document.body.style.cursor = 'none';
    };

    var isRunning = false; 

    const renderGameFrame = function(){
        if (!isRunning) return; 
    
        keys = inputController.getKeys();
    
        gameCanvas.clear();
        const delta = player.updateCarState(baseOffset);
        handleSpeedAndPosition(keys, delta);
    
        Draw.drawBackground(+((player.posx)*3.5), backgroundImage);
    
        var ctxForDither = context.getImageData(0, 0, canvas.width, render.height);
        var ctxFromD = Filter.dither(ctxForDither, ditherParams);
        context.putImageData(ctxFromD, 0, 0);
    
        Draw.drawSlideText(+((player.posx)*11), textImage);
        setActionByAbsoluteIndex();
    
        Draw.renderSlideHUD(hud, contentContainer, startTime, player, absoluteIndex, currentDialogueImage, currentDialogueText, roadParam, render);
        drawElements(contentContainer.elements);
        context.drawImage(infoImage, 100, 620);
    
        animationFrameId = requestAnimationFrame(renderGameFrame);
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
        soundPlaying();
        player.speed = Math.max(0, player.speed);
        player.speed = Math.min(player.speed, player.maxSpeed);
      
        carMoving(keys, delta);
    }
      
    const carMoving = function(keys, delta) {
        if (keys[37] && player.speed > 0) {
          player.posx -= 2*player.speed;
        }
    }

    function roundNumber(num, decimals) {
        let factor = Math.pow(10, decimals);
        return Math.round(num * factor) / factor;
    }

    const soundPlaying = function() {
        noiseVolume = roundNumber(player.speed, 0) > 0.001 ? roundNumber(player.speed, 3) * 2 / 10 : 0;
        Sound.noise('../src/media/sounds/rover_noise.mp3', roundNumber(noiseVolume, 3));

        if (Math.abs(player.delta) > 130 && player.speed > 3) {
            Sound.fx('../src/media/sounds/alarm.mp3');
            player.speed -= 0.2;
          }
    }

    const setState = function(){
        player.posx = 11;
        stateManager.setView('story');
        stateManager.setContent("C6_S1");
        Sound.noiseStop();
        gameCanvas.clear();
        isRunning = false; 
        cancelAnimationFrame(animationFrameId);
        RenderManager.render();
        return;
    }
    

    const drawElements = function(elements) {
        document.fonts.ready.then(function () {
            Object.entries(elements).forEach(element => {
                if (element[1].type === 'button' || element[1].type === 'text'){
                    Draw.writeText(element, (element[1].x + element[1].textBoxEnd));
                }
            });
        });
    }

    const setActionByAbsoluteIndex = function(){
        if(player.posx < -3000 || player.posx > 0){
            setState();
        }
    }

    const getImageByLanguage = function(textPath) {
        state = dataController.loadState();
        languageFile = dataController.loadLanguageFile(state);
        const path = languageFile[textPath];
        return path;
    }
    
    return {
        start: function(state){
            var state = state;
            init(state);
            isRunning = true;
            animationFrameId = requestAnimationFrame(renderGameFrame);
        },        
        updateCarState: function(){
            player.updateCarState(lastDelta);
        }
    }
}
());
