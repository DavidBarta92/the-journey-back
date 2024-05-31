import gameCanvas from "../models/gameCanvas";
import dataController from "../controllers/dataController";
import stateManager from "../controllers/stateManager";

var Draw = (function(){

    var context = gameCanvas.getContext();
    var canvas = gameCanvas.getCanvas();
    let state = stateManager.loadState();
    var languageFile;
    var spritesheet = new Image();
    var currentTimeString = "";

    const carImage = new Image();
    carImage.src = '../src/media/images/kiskep.png';

    const loadLanguage = function () {
        state = dataController.loadState();
        languageFile = dataController.loadLanguageFile(state);
    };

    const activeArea = function (element) {
        const { x, y, width, height } = element[1];

        if(element[1].hasOwnProperty('appoint') 
        && element[1].appoint === true 
        && element[1].hasOwnProperty('text')){
            writeText(element[1]);
        }
    
        context.beginPath();
    
        if (element[1].clicked === true) {
            context.lineWidth = 4;
            context.strokeStyle = "#dbe0bc";
            context.rect(x, y, width, height);
        } else if (element[1].allowed === true) {
            context.lineWidth = 2;
            context.strokeStyle = "#dc3a15";
            drawCrosses(x, y, width, height);
        } else {
            context.strokeStyle = "red";
            context.lineWidth = 2;
            context.rect(x, y, width, height);
            drawDiagonalLines(x, y, width, height);
        }
    
        context.stroke();
        context.closePath();
    };

    const drawCross = function (x, y) {
        drawLine(x - 7, y, x + 7, y);
        drawLine(x, y - 7, x, y + 7);
    };
    
    const drawCrosses = function (x, y, width, height) {
        drawLine(x - 7, y, x + 7, y);
        drawLine(x, y - 7, x, y + 7);
        drawLine(x + width - 7, y, x + width + 7, y);
        drawLine(x + width, y - 7, x + width, y + 7);
        drawLine(x - 7, y + height, x + 7, y + height);
        drawLine(x, y + height - 7, x, y + height + 7);
        drawLine(x + width - 7, y + height, x + width + 7, y + height);
        drawLine(x + width, y + height - 7, x + width, y + height + 7);
    };
    
    const drawDiagonalLines = function (x, y, width, height) {
        drawLine(x + 10, y + 10, x + width - 10, y + height - 10);
        drawLine(x + width - 10, y + 10, x + 10, y + height - 10);
    };
    
    const drawLine = function (x1, y1, x2, y2) {
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
    };
    
    //write the given text in the chosen language
    const writeText = function (
        element,
        textBoxX = window.innerWidth,
        color = element.color
    ) {
        const { x, y, fontSize, font, text, shadow} = element;
        const fontString = fontSize + "px " + font;
        const words = languageFile[text]?.split(" ") || [text];
    
        context.beginPath();
        context.font = fontString;
        context.fillStyle = color;

        if(element.hasOwnProperty('vertical') 
        && element.vertical === true ){
            context.translate(x, y);
            context.rotate(-Math.PI / 2);
            context.fillText(words, 0, 7);
            context.resetTransform();
        } else {
            let currentLineX = x;
            let currentLineY = y;
            const lineheight = fontSize + fontSize / 4;
        
            for (const word of words) {
                const currentWordWidth = context.measureText(word + " ").width;
        
                if (currentLineX + currentWordWidth > textBoxX) {
                    currentLineY += lineheight;
                    currentLineX = x;
                }
                if (shadow){
                    context.shadowOffsetX = 0;
                    context.shadowOffsetY = 0;
                    context.shadowColor = shadow;
                    context.shadowBlur = 5;
                }
                context.fillText(word + " ", currentLineX, currentLineY);
                currentLineX += currentWordWidth;
                context.shadowBlur = 0;
            }
        }
    
        context.closePath();
    };
    

        const drawString = function(string, pos) {
            string = string.toUpperCase();
            var cur = pos.x;
            for(var i=0; i < string.length; i++) {
                spritesheet.src = "../src/media/images/spritesheet.high.png";
                context.drawImage(spritesheet, (string.charCodeAt(i) - 32) * 8, 0, 8, 8, cur, pos.y, 8, 8);
                cur += 8;
            }
        }

        const drawBackground = function(positionX, positionY, image) {
            var positionXmod = positionX / 20 % (image.width);
            var positionYmod = positionY / 20 % (image.height);
            drawPrimImage(image, positionXmod + 700, positionYmod, 2.2, 2.2);
        }

        // Drawing primitive
        const drawPrimImage = function(image, x, y, scaleW, scaleH){
            context.drawImage(image, x, y, image.width, image.height, 0, 0, scaleW*image.width, scaleH*image.height);
        };

    // --------------------------
    // --     Draw the hud     --
    // --------------------------
    const renderHUD = function(hud, contentContainer, startTime, player, absoluteIndex, currentDialogueImage, currentDialogueText, roadParam, render){
        context.drawImage(hud, 0, 0, canvas.width, canvas.height);

        var now = new Date();
        var diff = now.getTime() - startTime.getTime();
        
        var min = Math.floor(diff / 60000);
        
        var sec = Math.floor((diff - min * 60000) / 1000); 
        if(sec < 10) sec = "0" + sec;
        
        var mili = Math.floor(diff - min * 60000 - sec * 1000);
        if(mili < 100) mili = "0" + mili;
        if(mili < 10) mili = "0" + mili;
        
        currentTimeString = ""+min+":"+sec+":"+mili;

        drawString(currentTimeString, {x: 30, y: 500});

        var speed = Math.round((player.speed / player.maxSpeed * 200) / 6 );
        drawString(""+speed+"mph", {x: 30, y: 488});

        var percent = ""+Math.round(absoluteIndex/(roadParam.length-render.depthOfField)*100)+"%";

        //draw dialoge things
        if (!!currentDialogueText) currentDialogueImage.src = currentDialogueText.image;
        context.drawImage(currentDialogueImage, 959, 42, 310, 177);
        if (!!currentDialogueText) writeText(currentDialogueText.text, (currentDialogueText.text.x + currentDialogueText.text.textBoxEnd));

        drawString(percent,{x: 287, y: 488});

        contentContainer.elements.speedCounter.text = speed + "mph";
        contentContainer.elements.percentCounter.text = percent;

        contentContainer.elements.speedCounter.x = 33;
        contentContainer.elements.speedCounter.y = 553;
        contentContainer.elements.speedCounter.color = "#dc3a15";
        writeText(contentContainer.elements.speedCounter);
        contentContainer.elements.speedCounter.x = 30;
        contentContainer.elements.speedCounter.y = 550;
        contentContainer.elements.speedCounter.color = "white";
        writeText(contentContainer.elements.speedCounter);
        writeText(contentContainer.elements.percentCounter);

        context.beginPath();
        context.lineWidth = "2";
        context.strokeStyle = "#dc3a15";
        context.rect(30, 620, 30, 30);
        context.stroke();
        context.beginPath();
        context.lineWidth = "2";
        context.strokeStyle = "#dc3a15";
        context.rect(750, 620, 30, 30);
        context.stroke();
        context.beginPath();
        context.lineWidth = "3";
        context.strokeStyle = "#dc3a15";
        context.rect(30, 635, 750, 0);
        context.stroke();
    }

    const drawRect = function(rotationAngle) {
        var rectX = canvas.width / 2;
        var rectY = canvas.height / 2;
        var rectWidth = 50;
        var rectHeight = 100;

        //context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "red";
        context.translate(rectX + rectWidth / 2, rectY + rectHeight / 2);
        context.rotate(rotationAngle);
        context.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
        context.rotate(-rotationAngle);
        context.translate(-(rectX + rectWidth / 2), -(rectY + rectHeight / 2));
    }

    const renderMapHUD = function(circle, dot, targetPoint, angle) {
        context.beginPath();
        context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        context.strokeStyle = "#dc3a15";
        context.lineWidth = 3;
        context.stroke();

        context.translate(circle.x, circle.y); // Áthelyezés a kör közepére
        context.rotate(angle + Math.PI / 2); // Elforgatás 90 fokkal
        context.drawImage(carImage, -30, -30, 60, 60); // Középre rajzolás
        context.rotate(-(angle + Math.PI / 2)); // Forgatás vissza
        context.translate(-circle.x, -circle.y); // Áthelyezés vissza
  
        context.lineWidth = 2;
        context.strokeStyle = "#dc3a15";
        drawCross(targetPoint.x, targetPoint.y);
        context.stroke();
        context.closePath();
  
        const compassDot = calculateClosestPoint(targetPoint, circle);
        context.fillStyle = "#dc3a15";
        context.beginPath();
        context.arc(compassDot.x, compassDot.y, 6, 0, Math.PI * 2);
        context.fill();
  
        // context.beginPath();
        // context.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
        // context.fillStyle = 'blue';
        // context.fill();
  
        if (targetPoint.x >= circle.x - 30 && targetPoint.x <= circle.x + 30 && targetPoint.y >= circle.y - 30 && targetPoint.y <= circle.y + 30) {
          context.fillStyle = 'black';
          context.font = '16px Arial';
          context.fillText('Hilépés', circle.x - 30, circle.y + 60);
        }
      }

      function calculateClosestPoint(targetPoint, circle) {
        const dx = targetPoint.x - circle.x;
        const dy = targetPoint.y - circle.y;
        const angleToPoint = Math.atan2(dy, dx);
        const closestX = circle.x + Math.cos(angleToPoint) * circle.radius;
        const closestY = circle.y + Math.sin(angleToPoint) * circle.radius;
        return { x: closestX, y: closestY };
      }

    const drawSprite = function(sprite){
        //if(sprite.y <= sprite.ymax){
            var destY = sprite.y - sprite.i.h * sprite.s;
            if(sprite.ymax < sprite.y) {
                var h = Math.min(sprite.i.h * (sprite.ymax - destY) / (sprite.i.h * sprite.s), sprite.i.h);
            } else {
                var h = sprite.i.h; 
            }
            //sprite.y - sprite.i.h * sprite.s
            spritesheet.src = "../src/media/images/spritesheet.high.png";
            if(h > 0) context.drawImage(spritesheet,  sprite.i.x, sprite.i.y, sprite.i.w, h, sprite.x, destY, sprite.s * sprite.i.w, sprite.s * h);
        //}
    };

    return {
        activeArea: function(element){
            return activeArea(element);
        },

        writeText: function(element, textBoxX = window.innerWidth, color = element.color){
            loadLanguage();
            if(element[1].hasOwnProperty('clicked') 
            && element[1].clicked === true 
            && element[1].type === 'button'){
                writeText(element[1], (element[1].x + element[1].textBoxEnd), "#dc3a15");
                return;
            } 
            if(element[1].hasOwnProperty('appoint') 
            && element[1].appoint === true 
            && element[1].type === 'button'){
                element[1].shadow = "#bf300f";
                var color = element[1].color;
                element[1].color = "#e65939";
                writeText(element[1], (element[1].x + element[1].textBoxEnd), "#e65939");
                element[1].shadow = null;
                element[1].color = color;
                return;
            } else {
                writeText(element[1], textBoxX, color);
                return;
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
        },

        renderHUD: function(hud, contentContainer, startTime, player, absoluteIndex, currentDialogueImage, currentDialogueText, roadParam, render){
            loadLanguage();
            return renderHUD(hud, contentContainer, startTime, player, absoluteIndex, currentDialogueImage, currentDialogueText, roadParam, render);
        },

        renderMapHUD: function(circle, dot, targetPoint, angle){
            return renderMapHUD(circle, dot, targetPoint, angle);
        },

        drawString: function(string, pos){
            loadLanguage();
            return drawString(string, pos);
        },

        drawBackground: function(positionX, backgroundImage){
            var positionY = 8; 
            return drawBackground(positionX, positionY, backgroundImage);
        },

        drawMapBackground: function(positionX, positionY, backgroundImage){
            return drawBackground(positionX, positionY, backgroundImage);
        },

        drawSlideText: function(positionX, textImage){
            var positionY = 8; 
            return drawBackground(positionX, positionY, textImage);
        },

        sprite: function(sprite){
            return drawSprite(sprite);
        },

        carTop: function(rotationAngle){
            return drawRect(rotationAngle);
        },

        }
    }
());

export default Draw;