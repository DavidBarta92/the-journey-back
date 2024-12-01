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
    const triangleImage = new Image();
    triangleImage.src = '../src/media/images/kisharomszog.png';

    const loadLanguage = function () {
        state = dataController.loadState();
        languageFile = dataController.loadLanguageFile(state);
    };

    const activeArea = function (element) {
        const { x, y, width, height } = element[1];
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

        if(element[1].hasOwnProperty('filter')
            && element[1].filter === "appointable"){
            if(element[1].hasOwnProperty('appoint') 
                && element[1].appoint === true 
                && element[1].hasOwnProperty('text')){
                    context.beginPath();
                    context.lineWidth = 1;
                    context.strokeStyle = "#dc3a15";
                    context.rect(x, y, width, height);
                    context.stroke();
                    var word = languageFile[element[1].text];
                    const textWidth = context.measureText(word).width;
                    context.fillStyle = "#F1F1F1";
                    context.fillRect(element[1].x+10, element[1].y-19, textWidth/2, 25);
                    writeText(element[1], 1500, "#dc3a15", 26, "Paskowy");
                    drawDottedPathToActiveArea(false, element);
            } else {
                drawDottedPathToActiveArea(true, element);
            }
        }
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

    const drawDottedPathToActiveArea = function (dotted = true, element, startPoint = {x: 21, y: 629}) {

    let endPoint = {"x": element[1].x, "y": element[1].y};

    const controlPoint1 = {
        x: (startPoint.x + endPoint.x) / 2,
        y: startPoint.y - 200
    };

    const controlPoint2 = {
        x: (startPoint.x + endPoint.x) / 2,
        y: endPoint.y + 20
    };

    const gradient = context.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    if (!dotted) {
        context.setLineDash([10, 0])
        gradient.addColorStop(0, 'rgba(220,58,21,1)'); // alul
        gradient.addColorStop(1, 'rgba(220,58,21,1)'); // felül #dc3a15

        context.beginPath();
        context.arc(startPoint.x, startPoint.y, 5, 0, Math.PI * 2);
        context.strokeStyle = "#dc3a15";
        context.lineWidth = 6;
        context.stroke();
    } else {
        context.setLineDash([10, 10])
        gradient.addColorStop(0, 'rgba(0,0,0,0.02)'); // alul
        gradient.addColorStop(1, 'rgba(220,58,21,1)'); // felül #dc3a15
    }
    context.strokeStyle = gradient;
    
    // Draw step by step by reducing the line thickness
    const steps = 10; // it was 100
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = (1 - t) * (1 - t) * (1 - t) * startPoint.x + 3 * (1 - t) * (1 - t) * t * controlPoint1.x + 3 * (1 - t) * t * t * controlPoint2.x + t * t * t * endPoint.x;
        const y = (1 - t) * (1 - t) * (1 - t) * startPoint.y + 3 * (1 - t) * (1 - t) * t * controlPoint1.y + 3 * (1 - t) * t * t * controlPoint2.y + t * t * t * endPoint.y;
        context.lineWidth = 4 - 3 * t;
        if (i === 0) {
            context.beginPath();
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
    }
    context.stroke();
    context.setLineDash([])
    context.closePath();
    };
    
    /**
     * Draws text onto a canvas element with specified properties.
     * 
     * @param {Object} element - The object containing text properties and coordinates.
     * @param {number} [textBoxX=window.innerWidth] - The maximum width of the text box.
     * @param {string} [color=element.color] - The color of the text.
     * @param {number} [fontSize=element.fontSize] - The size of the text font.
     * @param {string} [font=element.font] - The font family of the text.
     * 
     * The function takes an element object which must have the following properties:
     *  - x: The x-coordinate for the text position.
     *  - y: The y-coordinate for the text position.
     *  - text: The key to retrieve text from the language file or plain text to display.
     *  - shadow: (optional) The shadow color to apply to the text.
     *  - color: The color of the text.
     *  - fontSize: The font size of the text.
     *  - font: The font family of the text.
     *  - vertical: (optional) If true, the text is drawn vertically.
     * 
     * The function supports both horizontal and vertical text drawing. For vertical text, it rotates
     * the canvas and draws the text vertically. For horizontal text, it breaks the text into words and 
     * wraps it within the specified text box width. It also applies a shadow effect if specified.
     */
    const writeText = function (
        element,
        textBoxX = window.innerWidth,
        color = element.color,
        fontSize = element.fontSize,
        font = element.font
    ) {
        const { x, y, text, shadow} = element;
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

        const drawBackground = function(positionX, positionY, image, w = 1, h = 1) {
            var positionXmod = positionX / 20 % (image.width);
            var positionYmod = positionY / 20 % (image.height);
            drawPrimImage(image, positionXmod + 700, positionYmod, w, h);
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

        var triangleX = (720 * absoluteIndex / (roadParam.length - render.depthOfField)) + 30;
        var triangleY = 635;
    
        context.beginPath();
        context.moveTo(triangleX, triangleY);
        context.lineTo(triangleX - 10, triangleY + 15);
        context.lineTo(triangleX + 10, triangleY + 15);
        context.closePath();
        context.fillStyle = "#dc3a15";
        context.fill();
    }

    const renderSlideHUD = function(hud, contentContainer, startTime, player, absoluteIndex, currentDialogueImage, currentDialogueText, roadParam, render){
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

        drawString(currentTimeString, {x: 1230, y: 345});

        var speed = Math.round((player.speed / player.maxSpeed * 200) / 6 );
        drawString(""+speed+"mph", {x: 1230, y: 420});
    }

    const drawRect = function(rotationAngle) {
        var rectX = canvas.width / 2;
        var rectY = canvas.height / 2;
        var rectWidth = 50;
        var rectHeight = 100;

        context.fillStyle = "red";
        context.translate(rectX + rectWidth / 2, rectY + rectHeight / 2);
        context.rotate(rotationAngle);
        context.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
        context.rotate(-rotationAngle);
        context.translate(-(rectX + rectWidth / 2), -(rectY + rectHeight / 2));
    }

    const renderMapHUD = function(hud, circle, dot, targetPoints, angle, carTriangle) {
    context.lineWidth = 2;
    context.strokeStyle = "#dc3a15";
    
    targetPoints.forEach(point => {
        context.beginPath();
        drawCross(point.x, point.y);
        context.stroke();
        context.closePath();
    });

        if (!!hud) context.drawImage(hud, 0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        context.strokeStyle = "#dc3a15";
        context.lineWidth = 3;
        context.stroke();
    
        targetPoints.forEach(point => {
        const compassDot = calculateClosestPoint(point, circle);
        context.fillStyle = "#dc3a15";
        context.beginPath();
        context.arc(compassDot.x, compassDot.y, 6, 0, Math.PI * 2);
        context.fill();
        context.closePath();
        if(isPointInCircle(circle, point)) {
            context.beginPath();
            context.lineWidth = 1;
            context.moveTo(point.x, point.y);
            context.lineTo(compassDot.x, compassDot.y);
            context.stroke();
        }
        const textPoint = point;
        textPoint.x = compassDot.x;
        textPoint.y = compassDot.y;
        writeText(textPoint);
        });

        context.translate(dot.x, dot.y); 
        context.rotate(angle + Math.PI / 2); 
        context.drawImage(triangleImage, -30, -30, 60, 60); 
        context.rotate(-(angle + Math.PI / 2)); 
        context.translate(-dot.x, -dot.y);

        if (carTriangle) {
            context.translate(circle.x, circle.y); 
            context.rotate(angle + Math.PI / 2); 
            context.drawImage(carImage, -30, -30, 60, 60); 
            context.rotate(-(angle + Math.PI / 2)); 
            context.translate(-circle.x, -circle.y);   
        } else {
            context.beginPath();
            context.arc(circle.x, circle.y, 4, 0, Math.PI * 2);
            context.strokeStyle = "#dc3a15";
            context.lineWidth = 3;
            context.stroke();
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

    function isPointInCircle(circle, point) {
        // Számold ki a pont és a kör középpontja közötti távolságot
        const dx = point.x - circle.x;
        const dy = point.y - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        // Ellenőrizd, hogy a távolság kisebb-e vagy egyenlő-e a kör sugarával
        return distance <= circle.radius;
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

    const drawMiniElements = function(elementPositions) {
    
        elementPositions.elements.forEach(element => {
            drawMiniElement(element);
        });
    // its for drwing path between grouped elements. it's not finished and i'm not shure its is neccessary
        // let groupOfElements = groupElementsByGroupId(elementPositions.elements);
    
        // groupOfElements.forEach(group => {
        //     for (let i = 0; i < group.length; i++) {
        //         for (let j = i + 1; j < group.length; j++) {
        //             context.beginPath();
        //             context.moveTo(group[i].x, group[i].y);
        //             context.lineTo(group[j].x, group[j].y);
        //             context.strokeStyle = 'black';
        //             context.stroke();
        //         }
        //     }
        // });
    }
    
    const drawMiniElement = function(element) {
        context.beginPath();
        if (element.shape === 'circle') {
            context.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
        } else if (element.shape === 'square') {
            context.rect(element.x - element.radius, element.y - element.radius, element.radius * 2, element.radius * 2);
        } else if (element.shape === 'triangle') {
            context.moveTo(element.x, element.y - element.radius);
            context.lineTo(element.x - element.radius, element.y + element.radius);
            context.lineTo(element.x + element.radius, element.y + element.radius);
            context.closePath();
        }
        if (element.filled) {
            context.fillStyle = element.color;
            context.fill();
        } else {
            context.strokeStyle = element.color;
            context.stroke();
        }
    }

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
                context.beginPath();
                context.lineWidth = 2;
                context.strokeStyle = "#dc3a15";
                drawCross(element[1].x, element[1].y);
                context.stroke();
                context.closePath();
                if(element[1].hasOwnProperty('pointer') 
                && element[1].pointer === true){
                    drawDottedPathToActiveArea(false, element, {x: element[1].pointerX,y: element[1].pointerY});
                }
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
                context.beginPath();
                context.lineWidth = 2;
                context.strokeStyle = "#dc3a15";
                drawCross(element[1].x, element[1].y);
                context.stroke();
                context.closePath();
                if(element[1].hasOwnProperty('pointer') 
                    && element[1].pointer === true){
                        drawDottedPathToActiveArea(false, element, {x: element[1].pointerX,y: element[1].pointerY});
                    }
                return;
            } 
            if (element[1].type === 'button') {
                writeText(element[1], textBoxX, "#dc3a15");
                context.beginPath();
                context.lineWidth = 2;
                context.strokeStyle = "#dc3a15";
                drawCross(element[1].x, element[1].y);
                context.stroke();
                context.closePath();
                if(element[1].hasOwnProperty('pointer') 
                    && element[1].pointer === true){
                        drawDottedPathToActiveArea(true, element, {x: element[1].pointerX,y: element[1].pointerY});
                    }
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

        renderSlideHUD: function(hud, contentContainer, startTime, player, absoluteIndex, currentDialogueImage, currentDialogueText, roadParam, render){
            loadLanguage();
            return renderSlideHUD(hud, contentContainer, startTime, player, absoluteIndex, currentDialogueImage, currentDialogueText, roadParam, render);
        },


        renderMapHUD: function(hud, circle, dot, targetPoints, angle, carTriangle){
            return renderMapHUD(hud, circle, dot, targetPoints, angle, carTriangle);
        },

        drawString: function(string, pos){
            loadLanguage();
            return drawString(string, pos);
        },

        drawBackground: function(positionX, backgroundImage){
            var positionY = 8; 
            return drawBackground(positionX, positionY, backgroundImage, 2.2, 2.2);
        },

        drawMapBackground: function(positionX, positionY, backgroundImage){
            return drawBackground(positionX, positionY, backgroundImage);
        },

        drawSlideText: function(positionX, textImage){
            var positionY = 8; 
            return drawBackground(positionX, positionY, textImage, 2.2, 2.2);
        },

        sprite: function(sprite){
            return drawSprite(sprite);
        },

        carTop: function(rotationAngle){
            return drawRect(rotationAngle);
        },

        miniElements: function(elementPositions){
            return drawMiniElements(elementPositions);
        },

        }
    }
());

export default Draw;