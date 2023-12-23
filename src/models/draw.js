import gameCanvas from "../models/gameCanvas";
import dataController from "../controllers/dataController";
import stateManager from "../controllers/stateManager";

var Draw = (function(){

    var context = gameCanvas.getContext();
    var canvas = gameCanvas.getCanvas();
    let state = stateManager.loadState();
    var languageFile = dataController.loadLanguageFile(state);

    const activeArea = function(element) {
        if(element[1].hasOwnProperty('appoint') && element[1].appoint === true){
            //writeText("text", 100, "#a1a1a1");
            console.log("valami");
        }
        if(element[1].hasOwnProperty('clicked') && element[1].clicked === true){
            context.beginPath();
            context.lineWidth = "4";
            context.strokeStyle = "#dbe0bc";
            context.rect(element[1].x,element[1].y,element[1].width,element[1].height);
            context.stroke();
            context.closePath();
        } else {
            if(element[1].hasOwnProperty('allowed') && element[1].allowed === true){
                context.beginPath();
                context.lineWidth = 2;
                context.strokeStyle = "#dc3a15";
                context.moveTo(element[1].x - 7, element[1].y);
                context.lineTo(element[1].x + 7, element[1].y);
                context.stroke();
                context.moveTo(element[1].x, element[1].y - 7);
                context.lineTo(element[1].x, element[1].y + 7);
                context.stroke();
                context.moveTo(element[1].x + element[1].width - 7, element[1].y);
                context.lineTo(element[1].x + element[1].width + 7, element[1].y);
                context.stroke();
                context.moveTo(element[1].x + element[1].width, element[1].y - 7);
                context.lineTo(element[1].x + element[1].width, element[1].y + 7);
                context.stroke();
                context.moveTo(element[1].x - 7, element[1].y + element[1].height);
                context.lineTo(element[1].x + 7, element[1].y + element[1].height);
                context.stroke();
                context.moveTo(element[1].x, element[1].y + element[1].height - 7);
                context.lineTo(element[1].x, element[1].y + element[1].height + 7);
                context.stroke();
                context.moveTo(element[1].x + element[1].width - 7, element[1].y + element[1].height);
                context.lineTo(element[1].x + element[1].width + 7, element[1].y + element[1].height);
                context.stroke();
                context.moveTo(element[1].x + element[1].width, element[1].y + element[1].height - 7);
                context.lineTo(element[1].x + element[1].width, element[1].y + element[1].height + 7);
                context.stroke();
            } else {
                context.strokeStyle = "red";
                context.lineWidth = 2;
                context.beginPath();
                context.rect(element[1].x,element[1].y,element[1].width,element[1].height);
                context.stroke();
                context.moveTo(element[1].x + 10, element[1].y + 10);
                context.lineTo(element[1].x + element[1].width -10, element[1].y + element[1].height -10);
                context.stroke();
                context.moveTo(element[1].x + element[1].width - 10, element[1].y + 10);
                context.lineTo(element[1].x + 10, element[1].y + element[1].height - 10);
                context.stroke();
            }
        }
    }

    //write the given text in the chosen language
    const writeText = function(element, textBoxX = window.innerWidth, color = element.color){
        var fontString;
        var textString;
        fontString          = element.fontSize + "px " + element.font;
        context.beginPath();
        context.font        = fontString;
        context.fillStyle   = color;
        Object.entries(languageFile).forEach(label => {
            if (label[0] === element.text){
                textString = label[1]; 
                return;
            }
        });
        if (!!textString) {
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
                context.fillText(words[i], currentLineX, currentLineY);                    currentLineX = currentWordWidth + currentLineX;
            }
        } else {
            context.fillText(element.text, element.x, element.y);
        }
    }

    return {
        activeArea: function(element){
            return activeArea(element);
        },

        writeText: function(element, textBoxX = window.innerWidth, color = element.color){
            if(element[1].hasOwnProperty('clicked') 
            && element[1].clicked === true 
            && element[1].type === 'button'){
                console.log("clicked");
                return writeText(element[1], (element[1].x + element[1].textBoxEnd), "#dc3a15");
            } 
            if(element[1].hasOwnProperty('appoint') 
            && element[1].appoint === true 
            && element[1].type === 'button'){
                return writeText(element[1], (element[1].x + element[1].textBoxEnd), "#a1a1a1");
            } else {
                return writeText(element[1], textBoxX, color);
            }
            //only buttons have border
            if(element[1].hasOwnProperty('border') && element[1].border){
                var width = context.measureText(element[1].text).width + 2 * (element[1].fontSize / 10);
                var buttonTopLeftX = element[1].x - element[1].fontSize / 10;
                var buttonTopLeftY = element[1].y - element[1].fontSize + element[1].fontSize / 10;
    
                context.strokeStyle = element[1].color;
                context.rect(buttonTopLeftX, buttonTopLeftY, width, element[1].fontSize);
                context.stroke();
            }
        }

        }
    }
());

export default Draw;