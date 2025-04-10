import inputController from "../controllers/inputController";
import gameCanvas from "./gameCanvas";
import RenderManager from "../controllers/renderManager";
import stateManager from "../controllers/stateManager";
import Anim from "../views/anim";
import Filter from "../views/filter";
import dataController from "../controllers/dataController";
import Timer from "./timer";
import Sound from "./sound";
import D from "./debugLog";
import Draw from "./draw";

//all these variables and functions are used by the Menu and the Story functions

var render = gameCanvas.getParams();

var context = gameCanvas.getContext();

const infoImage = new Image();
infoImage.src = "../src/media/images/infobox_mouse.png";

gameCanvas.resize();

const video = document.getElementById('video');

let animationId;

let state;

var languageFile;

var requestNewFrame;

let menuInterval;
let storyInterval;
let clickInterval;
let animInterval;
let animationDone = true;

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
var middleground = new Image();

var transitionSound;

var music;

var atmo;

var glitchingElement;

var counterTimer;

function onView(button, stateView) {
    return button.place.includes(stateView);
}

//draw the background image. if its not possible it is just fill the screen with blue (after a filter comes)
const drawBackground = function(){
    var state = dataController.loadState();
    if(state.view === "menu") {
        context.drawImage(background,  0, 0, background.width, background.height, 0, 0, render.width, render.height);
        context.drawImage(middleground,  0, 0, middleground.width, middleground.height, 0, 0, render.width, render.height);
    } else {
        context.drawImage(background,  0, 0, background.width, background.height, 0, 0, render.width, render.height);
    }
    // var ctxForDither = context.getImageData(0, 0, render.width, render.height);
    // var ctxFromD = Filter.dither(ctxForDither);
    // context.putImageData(ctxFromD, 0, 0);
}

const getValidSpeechByIndex = function(speechIndex){ 
    let speechIndexIsValid = false;
    let validSpeech;
    try {
        Object.entries(dialogueFile).forEach(speech => {
            if (speech[0] === speechIndex) {
                speechIndexIsValid = true;
                validSpeech = speech;
                return;
            }
        });
    } catch (error) {
        console.error(error);
        console.warn('The dialog file may not be set in the dataController');
    }
    return {speechIndexIsValid, validSpeech};
}

//create interactive and writable entities based on dialogue element's params and push them to arrays
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

const allowElements = function(elements, state) {
    Object.entries(elements).forEach(element => {
        if(element[1].type === 'item'){
            if(element[0] === state.items.one 
            || element[0] === state.items.two
            || element[0] === state.items.three
            || element[0] === state.items.four
            || element[0] === state.items.five){
                element[1].allowed = true;
            } else {
                element[1].allowed = false;
            }  
        } else {
            element[1].allowed = true;
        }
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
            if (element[1].type === 'video'){
                context.drawImage(video, element[1].x, element[1].y, video.videoWidth, video.videoHeight);
                var ctxForDither = context.getImageData(0, 0, render.width, render.height);
                var ctxFromD = Filter.dither(ctxForDither);
                context.putImageData(ctxFromD, 0, 0);
                if(video.ended === false) animationDone = false;
            }
            if (element[1].type === 'infoImage' && Object.keys(interactives).length > 0){
                context.drawImage(infoImage, 550, 654);
            }
            if (element[1].type === 'image'){
                Draw.drawImageElement(element);
            }
            if (element[1].type === 'langImage'){
                Draw.drawImageElement(element);
            }
            if (element[1].type === 'button' || element[1].type === 'text'){
                Draw.writeText(element, (element[1].x + element[1].textBoxEnd));
            }
            if (element[1].type === 'item' && element[1].allowed === true){
                context.drawImage(spritesheet,  element[1].sourceX, element[1].sourceY, element[1].sourceW, element[1].sourceH, element[1].x, element[1].y, element[1].width, element[1].height);
            }
            if (element[1].type === 'sprite' && element[1].allowed === false){
                context.drawImage(spritesheet,  element[1].sourceX, element[1].sourceY, element[1].sourceW, element[1].sourceH, element[1].x, element[1].y, element[1].width, element[1].height);
            }
            if (element[1].type === 'activeArea'){
                Draw.activeArea(element);
            }
            if (element[1].type === 'trivia'){
                Draw.trivia(element);
            }
            if (element[1].type === 'items'){
                Draw.items(element);
            }
            if (element[1].type === 'chapter'){
                Draw.chapter(element);
            }
            if(element[1].hasOwnProperty('appoint') && element[1].appoint === true){
                    // context.strokeStyle = "#498564";
                    // context.lineWidth = 2;
                    // context.beginPath();
                    // context.rect(element[1].x,element[1].y,element[1].width,element[1].height);
                    // context.stroke();
                element[1].appoint = false;
            }
            if(element[1].hasOwnProperty('clicked') && element[1].clicked === true){
                Timer.wait(41);
                element[1].clicked = false;
            }
        });
        dialogueOptionClicked = false;
    });
    if (!!glitchingElement) {
        Anim.glitch(glitchingElement);
        glitchingElement = null;
        requestNewFrame = true;
    }
    Anim.crt();
}

// set video element params to be ready to played
const readyToPlayVideo = function(videoElement){
    video.src = videoElement.path;
    video.loop = videoElement.loop;
    video.mute = videoElement.mute;
}

// collects all elements from the view which ones are clickable objects or areas
const collectInteractives = function(elements){
    Object.entries(elements).forEach(element => {
        if (
            (element[1].hasOwnProperty('type') && element[1].type === 'button') ||
            (element[1].type === 'item') ||
            (element[1].type === 'activeArea') ||
            (element[1].type === 'trivia')
        ) {
            interactives[element[0]] = element[1];
        }
    });
}

// found the element in the elements list, witch is under the cursor
const getArea = function(elements){
    var foundElement = null;
    Object.entries(elements).forEach(element => {
        if (inputController.cursorOnElement(element[1])){
            foundElement = element;
        }
    });
    return foundElement;
}

const clickAnimate = function(element){
    if(!!element){
        animationDone = false;
        if (!animationDone) {
            Object.entries(contentContainer.elements).forEach(contElement => {
                if (contElement[0] === element[0]) contElement[1].clicked = true;
            });
            animationDone = true;
            return;
        }
    }    
}

const setTiming = function(){
    if(contentContainer.hasOwnProperty('timer')
        && contentContainer.timer.allowed){
        counterTimer = new Date();
        counterTimer.setMilliseconds(contentContainer.timer.time);
    }
}

const activateTiming = function(){
    var now = new Date();
    if(contentContainer.hasOwnProperty('timer')
    && counterTimer < now
    && !!counterTimer){
        hitArea(['timer',contentContainer.timer]);
    }    
}

// execute the predetermined action of the interactive element
const hitArea = function(element){
    if(!!element){
        if(element[1].allowed === true){
            if (element[1].hasOwnProperty('fx')) Sound.fx(element[1].fx);
            if (element[1].hasOwnProperty('sound')) {
                stateManager.setTransitionSound(element[1].sound);
            } else {
                stateManager.setTransitionSound(null);
            }
            D.log('element',element);
            if (element[1].actionType === "setToDrive") {
                stateManager.setView('driver');
                stateManager.setContent(element[1].action);
                gameCanvas.clear();
                counterTimer = null;
                cancelAnimationFrame(animationId);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "setToMenu") {
                var dataURL = gameCanvas.getDataURL();
                var bluredDataURL = Filter.imgElementBlur(dataURL);
                dataController.saveScreenImage(bluredDataURL);
                pause = true;
                video.pause();
                cancelAnimationFrame(animationId);
                interactives = {};
                stateManager.addItem(element[1].action);
                stateManager.setStatus();
                stateManager.setAtmoPath(contentContainer.atmo);
                stateManager.setView('menu');
                stateManager.setContent(element[1].action);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "setToSlide") {
                stateManager.setView('slide');
                stateManager.setContent(element[1].action);
                gameCanvas.clear();
                counterTimer = null;
                cancelAnimationFrame(animationId);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "setToMap") {
                stateManager.setView('map');
                stateManager.setContent(element[1].action);
                gameCanvas.clear();
                counterTimer = null;
                cancelAnimationFrame(animationId);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "setView") {
                stateManager.setView(element[1].action);
                gameCanvas.clear();
                interactives = {};
                counterTimer = null;
                cancelAnimationFrame(animationId);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "setContent") {
                console.log('setContent');
                stateManager.setContent(element[1].action);
                gameCanvas.clear();
                counterTimer = null;
                cancelAnimationFrame(animationId);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "setChapter") {
                stateManager.setChapter();
                gameCanvas.clear();
                counterTimer = null;
                cancelAnimationFrame(animationId);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "addItem") {
                if (element[1].hasOwnProperty('clickNoise') && element[1].clickNoise) Sound.fx('../src/media/sounds/click.ogg');
                stateManager.addItem(element[1].action);
                gameCanvas.clear();
                cancelAnimationFrame(animationId);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "deleteItem") {
                stateManager.deleteItem(element[1].action);
                gameCanvas.clear();
                cancelAnimationFrame(animationId);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "setLanguage") {
                stateManager.changeLanguage(element[1].action);
                gameCanvas.clear();
                cancelAnimationFrame(animationId);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "setMute") {
                stateManager.setVolume(element[1].action);
                gameCanvas.clear();
                cancelAnimationFrame(animationId);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "startGame") {
                if(element[1].action === 'start'){
                    if (stateManager.loadState().init){
                        stateManager.setView('story');
                        stateManager.setContent('firstSettings');
                        stateManager.setInitFalse();
                        stateManager.resetLevelChapterScene();
                        stateManager.resetItems();
                    } else {
                        stateManager.setContentByStatus();
                    }
                } 
                if(element[1].action === 'new'){
                    stateManager.setView('story');
                    stateManager.setContent('C1_intro1');
                    stateManager.setInitFalse();
                    stateManager.resetLevelChapterScene();
                    stateManager.resetItems();
                } else {
                    stateManager.setContentByStatus();
                    pause = false;
                }
                gameCanvas.clear();
                cancelAnimationFrame(animationId);
                RenderManager.render();
                return;
            }
            if (element[1].actionType === "exitGame") {
                gameCanvas.clear();
                cancelAnimationFrame(animationId);
                RenderManager.render();
                window.close();
            }
        return;
        }
            }
}

// execute the predetermined action of the interactive element
const appointingElement = function(elements){
    Object.entries(elements).forEach(element => {
        if (inputController.cursorOnElement(element[1])){
            if(element[1].filter === "appointable"){
                glitchingElement = {...element[1]};
                element[1].appoint = true;
                requestNewFrame = true;
            }
        } else {
            element[1].appoint = false;
        }
    });
}

//used to triggering animation frame by render game frame
const triggering = function(){
    if(requestNewFrame || context.globalAlpha <= 0.9 || dialogueOptionClicked || !animationDone){
        requestNewFrame = false;
        return true;
    } else {
        return false;
    }
}

//managing base sounds as music and atmo
const baseSound = function(type){
    Sound.transitonSound(transitionSound);
    if(type === 'story'){
        Sound.atmo(contentContainer.atmo);
        Sound.music(contentContainer.music);
    } else {
        Sound.menuAtmo();
       // Sound.music(contentContainer.music);
    }
}

var pause;
var keys = [];

const escAllowed = function(){
    return contentContainer.hasOwnProperty('escAllowed') ? contentContainer.escAllowed !== false : true;
}

const setPause = function() {
    var pState = stateManager.loadState();
    if(pState.view === 'menu'){
        stateManager.setContentByStatus();
        gameCanvas.clear();
        cancelAnimationFrame(animationId);
        RenderManager.render();
        Timer.wait(400);
        pause = false;
        return;
    }
    if(pState.view === 'story' && escAllowed() && pause === false){
        var dataURL = gameCanvas.getDataURL();
        var bluredDataURL = Filter.imgElementBlur(dataURL);
        dataController.saveScreenImage(bluredDataURL);
        pause = true;
        video.pause();
        cancelAnimationFrame(animationId);
        interactives = {};
        stateManager.setStatus();
        stateManager.setAtmoPath(contentContainer.atmo);
        stateManager.setView('menu');
        stateManager.setContent('main');
        RenderManager.render();
        return;
    }
}

//tracking cursor
const trackInput = function(){
    keys = inputController.getKeys();
    var activeArea = getArea(interactives);
    if(activeArea !== null){
        if(activeArea[1].type == 'activeArea') Sound.fx('../src/media/sounds/active_area.wav', activeArea[0]);
        if(activeArea[1].type == 'button') Sound.fx('../src/media/sounds/button.wav', activeArea[0]);
    }
    if(inputController.getCursor().click){
        requestNewFrame = true;
        if (!!activeArea && activeArea[1].allowed === true) clickAnimate(activeArea);
        const clicking = new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 50);
        });
        clicking.then(()=>{
            hitArea(activeArea);
        })
    }
    if(keys[27]) setPause();
    appointingElement(contentContainer.elements);
    activateTiming();
}

// -------------------------------
// -- Here comes the Menu funky ----------------------------------------------------------------------------------------------------------------------
// -------------------------------

// manages and runs the frame rendering of the menu
export const Menu = (function(){
    var keys = [];

    const init = function(state){
        context.globalAlpha = 0;
        // we need to empty this object when a new view is loaded
        interactives = {};
        contentContainer = dataController.loadContent(state);
        background = dataController.getLastScreenImage();
        middleground = dataController.loadImage(contentContainer.middlegroundPath);
        spritesheet = dataController.loadImage(contentContainer.spritesPath);
        collectInteractives(contentContainer.elements);
        allowElements(contentContainer.elements, state);
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
            cancelAnimationFrame(animationId);
            gameCanvas.clear();
            drawBackground();
            drawElements(contentContainer.elements);
        }
    }

    const trackAnimation = function(){
        if(triggering()) renderMenuFrame();
    }

    return {
        render: function(state){
            init(state);
            baseSound('menu');
            function animate() {
                trackAnimation();
                trackInput();
                animationId = requestAnimationFrame(animate);
            }           
            animationId = requestAnimationFrame(animate);
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
// -- The Story function starts here -----------------------------------------------------------------------------------------------------------------
// ------------------------------------

// manages and runs the frame rendering of the story view
export const Story = (function(){
    pause = false;
    var keys = [];

    const init = function(state){
        counterTimer = null;
        context.globalAlpha = 0
        // we need to empty this object when a new view is loaded
        interactives = {};
        contentContainer = dataController.loadContent(state);
        background = dataController.loadImage(contentContainer.backgroundPath);
        middleground = dataController.loadImage(contentContainer.middlegroundPath);
        spritesheet = dataController.loadImage(contentContainer.spritesPath);
        dialogueFile = dataController.loadDialogue(contentContainer.dialogue);
        newSpeechIndex = '1';
        transitionSound = state.transitionSound;
        contentContainer.elements["infoBox"] = {type: "infoImage"};
        allowElements(contentContainer.elements, state);
        collectInteractives(contentContainer.elements);
        languageFile = dataController.loadLanguageFile(state);
        if (contentContainer.elements.hasOwnProperty('video')) readyToPlayVideo(contentContainer.elements.video);
        setTiming();
        if(contentContainer.hasOwnProperty('cursor') && !contentContainer.cursor) document.body.style.cursor = 'none';
    }

    //render one frame of the story view
    const renderStoryFrame = function(){
        video.play();
        if(context.globalAlpha < 1){
            context.globalAlpha = (context.globalAlpha += 0.1).toFixed(1);
            gameCanvas.clear();
            drawBackground();
            drawElements(contentContainer.elements);
            //if (contentContainer.miniElements) 
            Filter.showMiniElements(contentContainer);
            console.log("new frame");
        } else {
            cancelAnimationFrame(animationId);
            gameCanvas.clear();
            drawBackground();
            drawElements(contentContainer.elements);
            //if (contentContainer.miniElements) 
            Filter.showMiniElements(contentContainer);
            console.log("new frame");
        }
    }

    const trackAnimation = function(){
        if(triggering()) renderStoryFrame();
    }
    
    return {
        render: function(state){
            init(state);
            baseSound('story');
            function animate() {
                trackAnimation();
                trackInput();
                if(stateManager.loadState().view === "story") animationId = requestAnimationFrame(animate);
            }           
            if(stateManager.loadState().view === "story") animationId = requestAnimationFrame(animate);
        },
    }
    
}
());

// multicégek gyarmatosították a valóságot