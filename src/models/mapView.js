import gameCanvas from "./gameCanvas.js";
import RenderManager from "../controllers/renderManager.js";
import stateManager from "../controllers/stateManager.js";
import { player } from "./player.js";
import inputController from "../controllers/inputController.js";
import dataController from "../controllers/dataController.js";
import Timer from "./timer.js";
import Draw from "./draw.js";

var backgroundImage = new Image();
var textImage = new Image();
var spritesheet = new Image();
var hud = new Image();
var currentDialogueImage = new Image();
var contentContainer;

export const Map = (function(){
    var pause = true;
    let animationId;
    var state = state;
    var canvas = gameCanvas.getCanvas();
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
    var baseOffset = 0;
    var squareTopLeftX; 
    var squareTopLeftY; 

    const circle = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 200 // Nagyobb kör
    };
  
    let dot = {
        x: circle.x + circle.radius,
        y: circle.y
    };
  
    let targetPoint = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
      };

    let angle = 0; // Kezdeti forgatási szög 

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
            width: canvas.height*0.7,
            height: canvas.height*0.7,
            depthOfField: 150,
            camera_distance: 30,
            camera_height: 150
        };

        squareTopLeftX = (canvas.width - render.width)/2; 
        squareTopLeftY = (canvas.height - render.height)/2; 
        
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

        Draw.drawMapBackground(+((player.posx)*3.5), +((player.posy)*3.5),backgroundImage);

        let targetPointRecalculated = {x: ((targetPoint.x)*3.5)/20%backgroundImage.width, y: ((targetPoint.y)*3.5)/20%backgroundImage.height};

        Draw.renderMapHUD(hud, circle, dot, targetPointRecalculated, angle);

        if (targetPointRecalculated.x >= circle.x - 30 
            && targetPointRecalculated.x <= circle.x + 30 
            && targetPointRecalculated.y >= circle.y - 30 
            && targetPointRecalculated.y <= circle.y + 30) {
            setState();
        }

        drawElements(contentContainer.elements);
    }

    ///////////////////////////////////////////////////////////////////////
      
    const handleSpeedAndPosition = function(keys, delta) {
        const ArrowUp = keys[38] ;
        const ArrowDown = keys[39]
        const ArrowLeft = keys[37];
        const ArrowRight = keys[40];
        if (ArrowUp || ArrowDown || ArrowLeft || ArrowRight) {
            const speed = player.speed;
            if (ArrowUp && dot.y > circle.y - circle.radius) dot.y -= speed;
            if (ArrowRight && dot.y < circle.y + circle.radius) dot.y += speed;
            if (ArrowLeft && dot.x > circle.x - circle.radius) dot.x -= speed;
            if (ArrowDown && dot.x < circle.x + circle.radius) dot.x += speed;
            calculateCarAngle();
            player.speed += player.acceleration;
        } else if (!ArrowUp && !ArrowDown && !ArrowLeft && !ArrowRight) {
          player.speed -= player.breaking;
        } else {
          player.speed -= player.deceleration;
        }

        player.speed = Math.max(0, player.speed); // Cannot go in reverse
        player.speed = Math.min(player.speed, player.maxSpeed); // Maximum speed
        carMoving(keys, delta);
    }

    const calculateCarAngle = function() {
        const dx = dot.x - circle.x;
        const dy = dot.y - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
  
        if (distance !== circle.radius) {
          const factor = circle.radius / distance;
          dot.x = circle.x + dx * factor;
          dot.y = circle.y + dy * factor;
        }
  
        // Számítás a kép forgatási szögéhez
        angle = Math.atan2(dot.y - circle.y, dot.x - circle.x);
    }

      
    const carMoving = function(keys, delta) {
        if (keys[37] && player.speed > 0) {
            player.posx -= 2*player.speed;
            targetPoint.x += 2*player.speed;
        }
        if (keys[38] && player.speed > 0) {
            player.posy -= 2*player.speed;
            targetPoint.y += 2*player.speed;
        }
        if (keys[39] && player.speed > 0) {
            player.posx += 2*player.speed;
            targetPoint.x -= 2*player.speed;
        }
        if (keys[40] && player.speed > 0) {
            player.posy += 2*player.speed;
            targetPoint.y -= 2*player.speed;
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
                if (element[1].type === 'button' || element[1].type === 'text'){
                    //if (element[1].hasOwnProperty('buttonKey')) drawPessKey(element[1].buttonKey);

                    Draw.writeText(element, (element[1].x + element[1].textBoxEnd));
                    
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
            function animate() {
                renderGameFrame();
                if(stateManager.loadState().view === "map") animationId = requestAnimationFrame(animate);
            }           
            if(stateManager.loadState().view === "map") animationId = requestAnimationFrame(animate);
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