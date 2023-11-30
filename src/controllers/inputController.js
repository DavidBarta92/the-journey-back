import gameCanvas from "../models/gameCanvas";
import Sound from "../models/sound";
import D from "../models/debugLog";

var inputController = (function(){

    const context = gameCanvas.getContext();

    let keys = [];
    let cursor = {
        x: 0,
        y: 0,
        click: false,
    };

    const init = function () {
        //register key handeling:
        window.onkeydown = function (event) {
            keys[event.keyCode] = true;
            D.log([event.keyCode]);
        };
        window.onkeyup = function (event) {
            keys[event.keyCode] = false;
        };

        //register mouse handeling:
        document.onmousedown = function (event) {
            D.log(["X:" , event.clientX , " | Y:" , event.clientY]);
            cursor.click = true;
            Sound.fx('../src/media/sounds/mouse.wav');
        };
        document.onmouseup = function (event) {
            cursor.click = false;
        };
        document.onmousemove = (event) => {
            cursor.x = event.offsetX;
            cursor.y = event.offsetY;
        };
    }

    const cursorOnElement = function(element){
        var canvasOffset = gameCanvas.canvasOffset();
        var offsetX = canvasOffset.left;
        var offsetY = canvasOffset.top;

        var mouseX = parseInt(cursor.x - offsetX);
        var mouseY = parseInt(cursor.y - offsetY);

        var elementX, elementY, elementWidth, elementHeight;

        if(element.type === 'button' || element.type === 'text'){
        elementX         = element.x - element.fontSize / 10;
        elementY         = element.y - element.fontSize + element.fontSize / 10;
        elementWidth     = context.measureText(element.text).width + 2 * (element.fontSize / 10);
        elementHeight    = element.fontSize;
        } else {
        elementX         = element.x;
        elementY         = element.y;
        elementWidth     = element.width;
        elementHeight    = element.height;
        }
        if (mouseX >= elementX && mouseX <= elementX + elementWidth && mouseY >= elementY && mouseY <= elementY + elementHeight){
            return true;
        } else {
            return false;
        }
    }

    return {
    init: function() {
        init();
    },
    getActualKey: function() {
        var actualKey;
        window.addEventListener('keypress', (event) => {
            actualKey = event;
          });
        return actualKey;
    },
    getKeys: function(){
        return keys;
    },
    getCursor: function(){ 
        return cursor;
    },
    cursorOnElement: function(element){
        return cursorOnElement(element);
    } 
    }
}());

export default inputController;