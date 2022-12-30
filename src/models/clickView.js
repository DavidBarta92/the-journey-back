import inputController from "../controllers/inputController";
import gameCanvas from "./gameCanvas";
import RenderManager from "../controllers/renderManager";
import stateManager from "../controllers/stateManager";
import Filter from "../views/filter";
import dataController from "../controllers/dataController";
import Timer from './timer';

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
let animInterval;

//it is an auxiliary variable to manage the bug coused by setInterval calling 
var dialogueOptionClicked;

//this object will store every object on the view
var contentContainer;

//this object will store all clickable area on the view
var interactives;

var dialogueFile;
var newSpeechIndex;
var spokenSpeeches = [];

var spritesheetForString = new Image();

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
    var state = dataController.loadState();
    if(state.view == "menu") {
        context.beginPath();
        context.fillStyle = "rgba(229, 224, 221, 1)";
        context.fillRect(530, 0, render.width, render.height);
        context.save();
        context.beginPath();
        context.rect(700, 150, 400, 500);
        context.clip();
        context.drawImage(background,  0, 0, background.width, background.height, 0, 0, render.width, render.height);
        var ctxForDither = context.getImageData(0, 0, render.width, render.height);
        var ctxFromD = Filter.dither(ctxForDither);
        context.putImageData(ctxFromD, 0, 0);
        context.restore();
        context.beginPath();
        context.lineWidth = "4";
        context.strokeStyle = "black";
        context.rect(700, 150, 400, 500);
        context.stroke();
        context.fillStyle = "rgba(250, 126, 59, 1)";
        context.fillRect(0, 0, 530, render.height);
    } else {
        context.drawImage(background,  0, 0, background.width, background.height, 0, 0, render.width, render.height);
        var ctxForDither = context.getImageData(0, 0, render.width, render.height);
        var ctxFromD = Filter.dither(ctxForDither);
        context.putImageData(ctxFromD, 0, 0);
    }
}

//write the given text in the chosen language
const writeText = function(element, textBoxX = window.innerWidth){
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
    if (!(textString == null)) {
        var lineheight = element.fontSize +(element.fontSize /4);
        var currentLineX = element.x;
        var currentLineY = element.y;
        var words = textString.split(' ');

        for (var i = 0; i<words.length; i++) {
            words[i] = words[i] + ' ';
            var currentWordWidth = context.measureText(words[i]).width;
            if (currentLineX + currentWordWidth > textBoxX) {
                currentLineY = currentLineY + lineheight;
            currentLineX = element.x;
            console.log((currentLineX + currentWordWidth) + " | x:" + currentLineX + " y:" + currentLineY);
          }
          context.fillText(words[i], currentLineX, currentLineY);
          currentLineX = currentWordWidth + currentLineX;
        }
    } else {
        context.fillText(element.text, element.x, element.y);
    }
}

const getValidSpeechByIndex = function(speechIndex){
    let speechIndexIsValid = false;
    let validSpeech;
    Object.entries(dialogueFile).forEach(speech => {
        if (speech[0] === speechIndex) {
            speechIndexIsValid = true;
            validSpeech = speech;
            return;
        }
    });
    return {speechIndexIsValid, validSpeech};
}

//create interactive and writable entities based on dialogue element1s params and push them to arrays
const pushDialogueElements = function(dialogueBox){
    let rightSideOfLastButton = 0;
    let boxLeftWithPadding = dialogueBox.x + dialogueBox.padding;
    let boxTopWithPadding = dialogueBox.y + dialogueBox.padding;
    let speech;
    //it could be text or button, we'll push this object to the write text func
    let dialogueElement = {
        dialType : dialogueBox.type,
        x: boxLeftWithPadding,
        y: boxTopWithPadding, //default param but we need to change it
        color: dialogueBox.colorOfSpeech,
        font: dialogueBox.fontOfSpeech,
        fontSize: dialogueBox.fontSizeOfSpeech,
    };
    let currentSpeechObj = getValidSpeechByIndex(newSpeechIndex);
    if (currentSpeechObj.speechIndexIsValid) {
        speech = currentSpeechObj.validSpeech;
        speech[1].forEach(element => {
            if (element.type === "params") {
                dialogueElement.type = "text";
                dialogueElement.y = dialogueBox.y + dialogueBox.padding + parseInt(context.measureText(element.text).actualBoundingBoxAscent);
                dialogueElement.fontSize = dialogueBox.fontSizeOfSpeech;
                dialogueElement.font = dialogueBox.fontOfSpeech;
                dialogueElement.color = dialogueBox.colorOfSpeech;
                dialogueElement.text = element.text;
                dialogueElement.textBoxEnd = dialogueBox.h - dialogueBox.padding;
                spokenSpeeches.push(dialogueElement);
                contentContainer.elements["dial" + speech[0] + "text"] = dialogueElement;
            }
            if (element.type === "choice") {
                //dialogueElement.y = dialogueBox.y + dialogueBox.padding + parseInt(context.measureText(element.buttonText).actualBoundingBoxAscent);
                dialogueElement.type = "button";
                dialogueElement.text = element.buttonText;
                dialogueElement.x = boxLeftWithPadding + Math.round(rightSideOfLastButton);
                dialogueElement.y = dialogueBox.y + dialogueBox.h - dialogueBox.padding;
                dialogueElement.width = context.measureText(dialogueBox.fontOfButtons).width + 2 * (dialogueBox.fontSizeOfButtons / 10);
                dialogueElement.height = dialogueBox.fontSizeOfButtons;
                dialogueElement.color = dialogueBox.colorOfButtons;
                dialogueElement.font = dialogueBox.fontOfButtons;
                dialogueElement.fontSize = dialogueBox.fontSizeOfButtons;
                dialogueElement.border = true;
                dialogueElement.actionType = "dialogueOption";
                dialogueElement.action = element.option;
                //dialogueElement.filter = "glitch";
                dialogueElement.longText = element.text;
                rightSideOfLastButton = dialogueElement.x + parseInt(context.measureText(element.buttonText).width) - boxLeftWithPadding + 20;

                interactives["dial" + speech[0] + "-option" + element.option] = dialogueElement;
                contentContainer.elements["dial" + speech[0] + "-option" + element.option] = dialogueElement;
            }
            dialogueElement = {};
        });
    } else {
        console.log("Conversation is over.");
    }  
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

//draw all visible elements on the view
const drawElements = function(elements) {
    document.fonts.ready.then(function () {
         Object.entries(elements).forEach(element => {
            if (element[1].type === 'dialogue') {
                let currentSpeechObj = getValidSpeechByIndex(newSpeechIndex);
                if (currentSpeechObj.speechIndexIsValid) {
                    context.fillStyle = element[1].bgcolor;
                    context.fillRect(element[1].x, element[1].y, element[1].w, element[1].h);
                    if (element[1].processed === false) {
                        pushDialogueElements(element[1]);
                        contentContainer.elements[element[0]].processed = true;
                        drawElements(elements);
                    }
                }
            };
            if (element[1].type === 'button' || element[1].type === 'text'){
                writeText(element[1], (element[1].x + element[1].textBoxEnd));
                
                //only buttons have border
                if(element.hasOwnProperty('border') && element[1].border){
                    var width = context.measureText(element[1].text).width + 2 * (element[1].fontSize / 10);
                    var buttonTopLeftX      = element[1].x - element[1].fontSize / 10;
                    var buttonTopLeftY      = element[1].y - element[1].fontSize + element[1].fontSize / 10;
        
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
        dialogueOptionClicked = false;
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
                clearInterval(storyInterval);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "setContent") {
                stateManager.setContent(element[1].action);
                gameCanvas.clear();
                clearInterval(menuInterval);
                clearInterval(storyInterval);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "dialogueOption") {
                if (!dialogueOptionClicked) {
                    newSpeechIndex = newSpeechIndex + "-" + element[1].action;
                    contentContainer.elements.dialogue.processed = false;
                    deleteDialogueElements();
                    dialogueOptionClicked = true;
                }
                return;
            }
            if (element[1].actionType === "startGame") {
                if(element[1].action == 'new'){
                    stateManager.setView('story');
                    stateManager.setContent('cargo_outside');
                    stateManager.resetLevelChapterScene();
                    stateManager.resetItems();
                } else {
                    stateManager.setContentByStatus();
                }
                gameCanvas.clear();
                clearInterval(menuInterval);
                clearInterval(storyInterval);
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
    if(context.globalAlpha <= 0.9 || dialogueOptionClicked){
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
        background = dataController.getLastScreenImage();
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
            },

        //its only for th first screen rendering at the game starting (this preload pictures, fonts for the clickview)
        preRender: function(state){
            init(state);
            renderMenuFrame();
            RenderManager.render();
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
        dialogueFile = dataController.loadDialogue(contentContainer.dialogue);
        newSpeechIndex = '1';
        collectInteractives(contentContainer.elements);
        languageFile = dataController.loadLanguageFile(state);
    }

    const setPause = function() {
        var dataURL = gameCanvas.getDataURL();
        dataController.saveScreenImage(dataURL);
        pause = true;
        clearInterval(storyInterval);
        stateManager.setStatus();
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
            drawBackground();
            drawElements(contentContainer.elements);
        }
    }

    //tracking cursor
    const trackInput = function(){
        keys = inputController.getKeys();
        if(cursor.click) hitArea(interactives, state);
        if(keys[27]) setPause();
    }

    const trackAnimation = function(){
        if(triggering()) renderStoryFrame();
    }

    return {
        render: function(state){
            init(state);
            animInterval = setInterval(trackAnimation, 6);
            clickInterval = setInterval(trackInput, 6);
        },
    }
}
());

// multicégek gyarmatosították a valóságot