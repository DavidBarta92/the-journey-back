import inputController from "../controllers/inputController";
import gameCanvas from "./gameCanvas";
import RenderManager from "../controllers/renderManager";
import stateManager from "../controllers/stateManager";
import Filter from "../views/filter";
import main from '../views/menu/main.json';
import credits from '../views/menu/credits.json';
import controlls from '../views/menu/controlls.json';
import train from '../views/story/train.json';
import dataController from "../controllers/dataController";

//all these variables and functions are used by the Menu and the Story functions

var render = gameCanvas.getParams();

var context = gameCanvas.getContext();

let cursor = inputController.getCursor();

gameCanvas.resize();

let state;

let menuInterval;
let storyInterval;

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

//draw all visible elements on the view
const drawElements = function(elements) {
    var fontString;
    var elementImage;
    Object.entries(elements).forEach(element => {
        if (element[1].type === 'button' || element[1].type === 'text'){
            fontString          = element[1].fontSize + "px " + element[1].font;
            context.font        = fontString;
            context.fillStyle   = element[1].color;
            context.fillText(element[1].text, element[1].x, element[1].y);

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
                // uncecessary declare here
                context.drawImage(spritesheet,  element[1].sourceX, element[1].sourceY, element[1].sourceW, element[1].sourceH, element[1].x, element[1].y, element[1].w, element[1].h);
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
                clearInterval(menuInterval);
                RenderManager();
                return;
            }
            if (element[1].actionType === "setContent") {
                stateManager.setContent(element[1].action);
                clearInterval(menuInterval);
                RenderManager();
                return;
            }
            if (element[1].actionType === "exitGame") {
                RenderManager();
                window.close();
            }
        }
    });
}

// -------------------------------
// -- Here comes the Menu funky --
// -------------------------------

// manages and runs the frame rendering of the menu
export const Menu = (function(){
    const init = function(state){
        // we need to empty this object when a new view is loaded
        interactives = {};
        contentContainer = dataController.loadContent(state);
        background = dataController.loadImage(contentContainer.backgroundPath);
        spritesheet = dataController.loadImage(contentContainer.spritesPath);
        collectInteractives(contentContainer.elements);
    }

    //render one frame of the menu
    const renderMenuFrame = function(){
        drawBackground();
        drawElements(contentContainer.elements);
        if(cursor.click){
            hitArea(interactives, state);
        }
    }

    return {
        render: function(state){
            init(state);
            menuInterval = setInterval(renderMenuFrame, 60);
        }
        }
    }
());

// ------------------------------------
// -- The Story function starts here --
// ------------------------------------

// manages and runs the frame rendering of the story view
export const Story = (function(){

    const init = function(state){
        // we need to empty this object when a new view is loaded
        interactives = {};
        contentContainer = dataController.loadContent(state);
        background = dataController.loadImage(contentContainer.backgroundPath);
        spritesheet = dataController.loadImage(contentContainer.spritesPath);
        collectInteractives(contentContainer.elements);
    }

    //render one frame of the menu
    const renderStoryFrame = function(){
        drawBackground(contentContainer.backgroundPath);
        drawElements(contentContainer.elements);

        if(cursor.click){
            hitArea(interactives, state);
        }
    }

    return {
        render: function(state){
             init(state);
             storyInterval = setInterval(renderStoryFrame, 60);
        },
        }
    }
());