import inputController from "../controllers/inputController";
import gameCanvas from "../models/gameCanvas";
import RenderManager from "../controllers/renderManager";
import stateManager from "../controllers/stateManager";
import Dither from "./dither";

var Menu = (function(){

    var render = gameCanvas.getParams();

    var context = gameCanvas.getContext();

    gameCanvas.resize();

    const buttons = {
        continue : {
            text: 'Continue',
            x: 10,
            y:150,
            width: 70,
            height: 20,
            color: 'white',
            font: 'Arial',
            fontSize: 20,
            border: false,
            actionType: 'setView',
            action: 'racer',
            place: ['main',],
        },
        newGame : {
            text: 'New Game',
            x: 10,
            y:180,
            width: 70,
            height: 20,
            color: 'white',
            font: 'Arial',
            fontSize: 20,
            border: false,
            actionType: 'setView',
            action: 'racer',
            place: ['main',],
        }, 
        controlls : {
            text: 'Controlls',
            x: 10,
            y:210,
            width: 70,
            height: 20,
            color: 'white',
            font: 'Arial',
            fontSize: 20,
            border: false,
            actionType: 'setContent',
            action: 'controlls',
            place: ['main',],
        }, 
        credits : {
            text: 'Credits',
            x: 10,
            y:240,
            width: 70,
            height: 20,
            color: 'white',
            font: 'Arial',
            fontSize: 20,
            border: false,
            actionType: 'setContent',
            action: 'credits',
            place: ['main',],
        },
        main_exit : {
            text: 'Exit',
            x: 10,
            y:270,
            width: 70,
            height: 20,
            color: 'white',
            font: 'Arial',
            fontSize: 20,
            border: false,
            actionType: '',
            action: '',
            place: ['main',],
        },
        back : {
            text: 'Back',
            x: 10,
            y:270,
            width: 70,
            height: 20,
            color: 'white',
            font: 'Arial',
            fontSize: 20,
            border: false,
            actionType: 'setContent',
            action: 'main',
            place: ['controlls', 'credits',],
        }, 
    };

    var spritesheet = new Image();
    spritesheet.src = "../media/spritesheet.high.png";

    var drawString = function(string, pos) {
        string = string.toUpperCase();
        var cur = pos.x;
        for(var i=0; i < string.length; i++) {
            context.drawImage(spritesheet, (string.charCodeAt(i) - 32) * 8, 0, 8, 8, cur, pos.y, 8, 8);
            cur += 8;
        }
    }

    function offset(el) {
        var box = el.getBoundingClientRect();
        var docElem = document.documentElement;
        return {
          top: box.top + window.pageYOffset - docElem.clientTop,
          left: box.left + window.pageXOffset - docElem.clientLeft
        };
    }

    function onView(button, stateView) {
        return button.place.includes(stateView);
    }

    var drawButtons = function(buttons, state) {
        var fontString;
        Object.entries(buttons).forEach(button => {
            if (!onView(button[1], state.content)) { return; }

            fontString          = button[1].fontSize + "px " + button[1].font;
            context.font        = fontString;
            context.fillStyle   = button[1].color;
            context.fillText(button[1].text, button[1].x, button[1].y);

            if(button[1].border){
                var width = context.measureText(button[1].text).width + 2 * (button[1].fontSize / 10);
                var buttonTopLeftX      = button[1].x - button[1].fontSize / 10;
                var buttonTopLeftY      = button[1].y - button[1].fontSize + button[1].fontSize / 10;
                var buttonBottomRightX  = button[1].x + context.measureText(button[1].text).width + 2 * (button[1].fontSize / 10);
                var buttonBottomRightY  = button[1].y + button[1].fontSize;
    
                context.strokeStyle = button[1].color;
                context.rect(buttonTopLeftX, buttonTopLeftY, width, button[1].fontSize);
                context.stroke();
            }
        });
    }

    var hitArea = function(event, buttons, state, context){
        console.log("X:" + event.offsetX + " | Y:" + event.offsetY);
        var canvas = gameCanvas.getCanvas();
        var canvasOffset = offset(canvas);
        var offsetX = canvasOffset.left;
        var offsetY = canvasOffset.top;

        event.preventDefault();
        var mouseX = parseInt(event.clientX - offsetX);
        var mouseY = parseInt(event.clientY - offsetY);

        Object.entries(buttons).forEach(button => {
            if (button[0] === "back" && state.content === "main") { return; }

            var buttonX         = button[1].x - button[1].fontSize / 10;
            var buttonY         = button[1].y - button[1].fontSize + button[1].fontSize / 10;
            var buttonWidth     = context.measureText(button[1].text).width + 2 * (button[1].fontSize / 10);
            var buttonHeight    = button[1].fontSize;
            if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth && mouseY >= buttonY && mouseY <= buttonY + buttonHeight){
                context.beginPath();    
                context.strokeStyle = 'blue';
                context.rect(buttonX, buttonY, buttonWidth, buttonHeight);
                context.stroke();
                if (button[1].actionType === "setView") {
                    stateManager.setView(button[1].action);
                    RenderManager();
                    return;
                }
                if (button[1].actionType === "setContent") {
                    stateManager.setContent(button[1].action);
                    RenderManager();
                    return;
                }
            }
        });
        }

    return {
        renderMain: function(state){
            var state = state;

            context.beginPath();
            context.fillStyle = "rgb(0,0,0)";
            context.fillRect(0, 0, render.width, render.height);

            var ctxForDither = context.getImageData(0, 0, render.width, render.height);
            var ctxFromD = Dither.filter(ctxForDither);
            context.putImageData(ctxFromD, 0, 0);

            context.font = "50px Arial";
            context.fillStyle = "white";
            context.fillText("StarSlider", 10, 50);
            context.font = "12px Arial";
            context.fillText("preAlpha", 230, 50);

            drawButtons(buttons, state);

            window.onclick = function (event) {
                hitArea(event, buttons, state, context);
            }

        },

        renderCredits: function(state){
            var state = state;

            context.fillStyle = "rgb(0,0,0)";
            context.fillRect(0, 0, render.width, render.height);

            context.font = "50px Arial";
            context.fillStyle = "white";
            context.fillText("StarSlider", 10, 50);
            context.font = "12px Arial";
            context.fillText("preAlpha", 230, 50);

            context.font = "30px Arial";
            context.fillStyle = "blue";
            context.fillText("Credits:", 10, 100);
            context.fillText("code, art: David Barta", 10, 130);

            drawButtons(buttons, state);

            window.onclick = function (event) {
                hitArea(event, buttons, state, context);
            }

        },

        renderControlls: function(state){
            var state = state;

            context.fillStyle = "rgb(0,0,0)";
            context.fillRect(0, 0, render.width, render.height);

            context.font = "50px Arial";
            context.fillStyle = "white";
            context.fillText("StarSlider", 10, 50);
            context.font = "12px Arial";
            context.fillText("preAlpha", 230, 50);


            context.font = "30px Arial";
            context.fillStyle = "blue";
            context.fillText("nstructions:", 10, 100);
            context.fillText("space to start, arrows to drive", 10, 130);

            drawButtons(buttons, state);

            window.onclick = function (event) {
                hitArea(event, buttons, state, context);
            }
        },

        }
    }
());

export default Menu;
