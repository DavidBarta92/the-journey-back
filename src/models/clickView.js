import inputController from "../controllers/inputController";
import gameCanvas from "./gameCanvas";
import RenderManager from "../controllers/renderManager";
import stateManager from "../controllers/stateManager";
import Filter from "../views/filter";
import dataController from "../controllers/dataController";

//all these variables and functions are used by the Menu and the Story functions

var render = gameCanvas.getParams();

var context = gameCanvas.getContext();

let cursor = inputController.getCursor();

gameCanvas.resize();

let state;

var languageFile;

let menuInterval;
let storyInterval;
let clickInterval;

//this object will store every object on the view
var contentContainer;

//this object will store all clickable area on the view
var interactives;

var spritesheetForString = new Image();
spritesheetForString.src = "../media/spritesheet.high.png";

var spritesheet = new Image();

var background = new Image();

const drawString = function(string, pos) {
    string = string.toUpperCase();
    var cur = pos.x;
    for(var i=0; i < string.length; i++) {
        context.drawImage(spritesheetForString, (string.charCodeAt(i) - 32) * 8, 0, 8, 8, cur, pos.y, 8, 8);
        cur += 8;
    }
}

function onView(button, stateView) {
    return button.place.includes(stateView);
}

const isGif = function(image){
    return String(image).includes("data:image/gif");
}

//draw the background image. if its not possible it is just fill the screen with blue (after a filter comes)
const drawBackground = function(){
    try {
        context.drawImage(background,  0, 0, background.width, background.height, 0, 0, render.width, render.height);
    } catch {
        context.beginPath();
        context.fillStyle = "rgb(30,0,250)";
        context.fillRect(0, 0, render.width, render.height);
    }
    var ctxForDither = context.getImageData(0, 0, render.width, render.height);
    var ctxFromD = Filter.dither(ctxForDither);
    context.putImageData(ctxFromD, 0, 0);
}

//write the given text in the chosen language
const writeText = function(element){
    var fontString;
    var textString;
    fontString          = element.fontSize + "px " + element.font;
    context.font        = fontString;
    context.fillStyle   = element.color;
    Object.entries(languageFile).forEach(label => {
        if (label[0] == element.text){
            textString = label[1]; 
            return;
        }
    });
    if (textString == null) {
        context.fillText(element.text, element.x, element.y);
    } else {
        context.fillText(textString, element.x, element.y);
    }
}

//draw all visible elements on the view
const drawElements = function(elements) {
    var elementImage;
    Object.entries(elements).forEach(element => {
        if (element[1].type === 'button' || element[1].type === 'text'){
            writeText(element[1]);

            //only buttons have border
            if(element.hasOwnProperty('border') && element[1].border){
                var width = context.measureText(element[1].text).width + 2 * (element[1].fontSize / 10);
                var buttonTopLeftX      = element[1].x - element[1].fontSize / 10;
                var buttonTopLeftY      = element[1].y - element[1].fontSize + element[1].fontSize / 10;
                //var buttonBottomRightX  = element[1].x + context.measureText(element[1].text).width + 2 * (element[1].fontSize / 10);
                //var buttonBottomRightY  = element[1].y + element[1].fontSize;
    
                context.strokeStyle = element[1].color;
                context.rect(buttonTopLeftX, buttonTopLeftY, width, element[1].fontSize);
                context.stroke();
            }
        }
        if (element[1].type === 'sprite' || element[1].type === 'item'){
            try {
                if (isGif(spritesheet)){
                    //sprites and items cant move (at this moment)
                    context.drawImage(spritesheet.frames[0].image,  element[1].sourceX, element[1].sourceY, element[1].sourceW, element[1].sourceH, element[1].x, element[1].y, element[1].w, element[1].h);
                } else {
                    // uncecessary declare here
                    context.drawImage(spritesheet,  element[1].sourceX, element[1].sourceY, element[1].sourceW, element[1].sourceH, element[1].x, element[1].y, element[1].w, element[1].h);
                }
            } catch(e) {
                console.log(e);
            }
        }
    });
}

// collects all elements from the view whichones are clickable objects or areas
const collectInteractives = function(elements){
    Object.entries(elements).forEach(element => {
        if (element[1].hasOwnProperty('type') && element[1].type === 'button' || element[1].type === 'item' || element[1].type === 'activeArea') {
            interactives[element[0]] = element[1];
        }
    });
}

// execute the predetermined action of the interactive element
const hitArea = function(elements){
    Object.entries(elements).forEach(element => {
        if (inputController.cursorOnElement(element[1])){            
            if (element[1].actionType === "setView") {
                stateManager.setView(element[1].action);
                gameCanvas.clear();
                clearInterval(menuInterval);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "setContent") {
                stateManager.setContent(element[1].action);
                gameCanvas.clear();
                clearInterval(menuInterval);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "startGame") {
                if(element[1].action == 'new'){
                    stateManager.setView('story');
                    stateManager.setContent('train');
                } else {
                    stateManager.setContentByStatus();
                }
                gameCanvas.clear();
                clearInterval(menuInterval);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "exitGame") {
                gameCanvas.clear();
                RenderManager.render();
                window.close();
            }
        }
    });
}

//used to triggering animation frame by render game frame
const triggering = function(){
    if(context.globalAlpha <= 0.9){
        return true;
    } else {
        return false;
    }
}

// -------------------------------
// -- Here comes the Menu funky --
// -------------------------------

// manages and runs the frame rendering of the menu
export const Menu = (function(){
    const init = function(state){
        context.globalAlpha = 0;
        // we need to empty this object when a new view is loaded
        interactives = {};
        contentContainer = dataController.loadContent(state);
        background = RenderManager.getLastScreenImage();
        spritesheet = dataController.loadImage(contentContainer.spritesPath);
        collectInteractives(contentContainer.elements);
        languageFile = dataController.loadLanguageFile(state);
    }

    //render one frame of the menu
    const renderMenuFrame = function(){
        if(context.globalAlpha < 1){
            context.globalAlpha = (context.globalAlpha += 0.1).toFixed(1);
            gameCanvas.clear();
            drawBackground();
            drawElements(contentContainer.elements);
        } else {
            clearInterval(menuInterval);
        }
    }

    //tracking cursor
    const trackInput = function(){
        if(cursor.click) hitArea(interactives, state);
    }

    return {
        render: function(state){
            init(state);
            if(triggering()) menuInterval = setInterval(renderMenuFrame, 100);
            clickInterval = setInterval(trackInput, 6);
            }
        }
    }
());

// ------------------------------------
// -- The Story function starts here --
// ------------------------------------

// manages and runs the frame rendering of the story view
export const Story = (function(){
    var pause = false;
    var keys = [];

    const init = function(state){
        context.globalAlpha = 0;
        // we need to empty this object when a new view is loaded
        interactives = {};
        contentContainer = dataController.loadContent(state);
        background = dataController.loadImage(contentContainer.backgroundPath);
        spritesheet = dataController.loadImage(contentContainer.spritesPath);
        collectInteractives(contentContainer.elements);
        languageFile = dataController.loadLanguageFile(state);
    }

    const setPause = function() {
        var lastScreenImage = new Image();
        lastScreenImage = context.getImageData(0, 0, render.width, render.height);
        RenderManager.saveScreenImage(lastScreenImage);
        pause = true;
        clearInterval(storyInterval);
        stateManager.setView('menu');
        stateManager.setContent('main');
        RenderManager.render();
    }

    //render one frame of the story view
    const renderStoryFrame = function(){
        if(context.globalAlpha < 1){
            context.globalAlpha = (context.globalAlpha += 0.1).toFixed(1);
            gameCanvas.clear();
            drawBackground();
            drawElements(contentContainer.elements);
        } else {
            clearInterval(storyInterval);
        }
    }

    //tracking cursor
    const trackInput = function(){
        keys = inputController.getKeys();
        if(cursor.click) hitArea(interactives, state);
        if(keys[27]) setPause();
    }

    return {
        render: function(state){
             init(state);
             if(triggering()) storyInterval = setInterval(renderStoryFrame, 100);
             clickInterval = setInterval(trackInput, 6);
        },
        }
    }
());