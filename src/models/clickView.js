import inputController from "../controllers/inputController";
import gameCanvas from "./gameCanvas";
import RenderManager from "../controllers/renderManager";
import stateManager from "../controllers/stateManager";
import Filter from "../views/filter";
import Anim from "../views/anim";
import dataController from "../controllers/dataController";
import Timer from "./timer";

//all these variables and functions are used by the Menu and the Story functions

var render = gameCanvas.getParams();

var context = gameCanvas.getContext();

let cursor = inputController.getCursor();

gameCanvas.resize();

let state;

var languageFile;

var requestNewFrame = false;

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
    context.beginPath();
    try {
        context.drawImage(background,  0, 0, background.width, background.height, 0, 0, render.width, render.height);
    } catch {
        context.fillStyle = "rgb(30,0,250)";
        context.fillRect(0, 0, render.width, render.height);
    }
    var ctxForDither = context.getImageData(0, 0, render.width, render.height);
    var ctxFromD = Filter.dither(ctxForDither);
    context.putImageData(ctxFromD, 0, 0);
}

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

var dialogueFadeArray = [];

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
                dialogueElement.filter = "dialogueFade";
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
                dialogueElement.filter = "glitch";
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
    var elementImage;
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
                    stateManager.setContent('train');
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

// execute the predetermined action of the interactive element
const glitchElement = function(elements){
    Object.entries(elements).forEach(element => {
        if (inputController.cursorOnElement(element[1])){
            if(element[1].filter == "glitch"){
                var glitchingElement = {...element[1]};
                glitchingElement.color = "yellow";
                writeText(glitchingElement);
                requestNewFrame = true;
            }
        }
    });
}

//used to triggering animation frame by render game frame
const triggering = function(){
    if(requestNewFrame || context.globalAlpha <= 0.9 || dialogueOptionClicked){
console.log("render");
        requestNewFrame = false;
        return true;
    } else {
        return false;
    }
}

// -------------------------------
// -- Here comes the Menu funky ----------------------------------------------------------------------------------------------------------------------
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
            gameCanvas.clear();
            drawBackground();
            drawElements(contentContainer.elements);
        }
    }

    //tracking cursor
    const trackInput = function(){
        if(cursor.click) hitArea(interactives);
        glitchElement(contentContainer.elements);
    }

    const trackAnimation = function(){
        if(triggering()) renderMenuFrame();
    }

    return {
        render: function(state){
            init(state);
            animInterval = setInterval(trackAnimation, 6);
            //if(triggering()) menuInterval = setInterval(renderMenuFrame, 100);
            clickInterval = setInterval(trackInput, 6);
            }
        }
    }
());

// ------------------------------------
// -- The Story function starts here -----------------------------------------------------------------------------------------------------------------
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
        console.log("rendering" + context.globalAlpha);
        if(context.globalAlpha < 1){
            context.globalAlpha = (context.globalAlpha += 0.1).toFixed(1);
            gameCanvas.clear();
            drawBackground();
            drawElements(contentContainer.elements);
        } else {
            clearInterval(storyInterval);
            gameCanvas.clear();
            drawBackground();
            drawElements(contentContainer.elements);
        }
    }

    //tracking cursor
    const trackInput = function(){
        keys = inputController.getKeys();
        if(cursor.click) hitArea(interactives);
        if(keys[27]) setPause();
        glitchElement(contentContainer.elements);
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