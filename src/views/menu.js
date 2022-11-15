import inputController from "../controllers/inputController";
import gameCanvas from "../models/gameCanvas";
import RenderManager from "../controllers/renderManager";
import stateManager from "../controllers/stateManager";

var Menu = (function(){

    var render = gameCanvas.getParams();

    var context = gameCanvas.getContext();

    gameCanvas.resize();

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
    
    //window.resize(resize);

    // var ui = {
    //     "buttons": [
    //      {
    //       "id": "continue_game",
    //       "x": 0,
    //       "y": 70,
    //       "width": 200,
    //       "height": 50,
    //       "text": "Continue",
    //       "font_size": 10,
    //       "font_family": "sans-serif",
    //       "border_color_default": "#555",
    //       "background_color_default": "#bfbfbf",
    //       "border_color_hover": "#7c7c7c",
    //       "background_color_hover": "#d8d8d8",
    //       "hl": false,
    //       "onclick": null
    //      },
    //      {
    //       "id": "new_game",
    //       "x": 0,
    //       "y": 0,
    //       "width": 200,
    //       "height": 50,
    //       "text": "New Game",
    //       "font_size": 10,
    //       "font_family": "sans-serif",
    //       "border_color_default": "#555",
    //       "background_color_default": "#bfbfbf",
    //       "border_color_hover": "#7c7c7c",
    //       "background_color_hover": "#d8d8d8",
    //       "hl": false,
    //       "onclick": 'null'
    //      },
    //      {
    //       "id": "exit_game",
    //       "x": 0,
    //       "y": -70,
    //       "width": 200,
    //       "height": 50,
    //       "text": "Exit",
    //       "font_size": 7,
    //       "font_family": "sans-serif",
    //       "border_color_default": "#555",
    //       "background_color_default": "#bfbfbf",
    //       "border_color_hover": "#7c7c7c",
    //       "background_color_hover": "#d8d8d8",
    //       "hl": false,
    //       "onclick": null
    //      }
    //     ],
    //     "text": []
    //    }

    // canvas.onmousemove = function(e){
    //     ui.buttons.map((obj, index) => { 
    //         if(e.clientX > ((canvas.width / 2 - (obj.width / 2) + obj.x) + canvas.offsetLeft - window.scrollX) 
    //         && e.clientY > ((canvas.height / 2 - (obj.height / 2) + -(obj.y)) + canvas.offsetTop - window.scrollY) 
    //         && e.clientX < ((canvas.width / 2 - (obj.width / 2) + obj.x) + obj.width  + canvas.offsetLeft) 
    //         && e.clientY < (((canvas.height / 2 - (obj.height / 2) + -(obj.y)) + canvas.offsetTop - window.scrollY) + obj.height + canvas.offsetTop)){ 
    //             ui.buttons[index].hl = true
    //             console.log('active');
    //         }
    //         else{
    //             ui.buttons[index].hl = false
    //         }
    //     })
    // }
    
    // canvas.onmousedown = function(e){
    //     ui.buttons.map((obj, index) => { 
    //         if(e.clientX > ((canvas.width / 2 - (obj.width / 2) + obj.x) + canvas.offsetLeft - window.scrollX) 
    //         && e.clientY > ((canvas.height / 2 - (obj.height / 2) + -(obj.y)) + canvas.offsetTop - window.scrollY) 
    //         && e.clientX < ((canvas.width / 2 - (obj.width / 2) + obj.x) + obj.width  + canvas.offsetLeft) 
    //         && e.clientY < (((canvas.height / 2 - (obj.height / 2) + -(obj.y)) + canvas.offsetTop - window.scrollY) + obj.height + canvas.offsetTop)){ 
    //             obj.onclick(e)
    //         }
    //     })
    // }

    // for(var btn of ui.buttons){
    //     ctx.fillStyle = '#bfbfbf'
    //     ctx.lineWidth = 2
    //     ctx.strokeStyle = '#555'
    //     ctx.textBaseline = 'middle'
    //     ctx.textAlign = 'center'
    //     ctx.font = btn.font_size + 'pt ' + btn.font_family
    //     if(btn.hl){
    //         ctx.strokeStyle = '#7c7c7c'
    //         ctx.fillStyle = '#d8d8d8'
    //     }
    //     ctx.fillRect(canvas.width / 2 - (btn.width / 2) + btn.x,
    //      canvas.height / 2 - btn.height / 2 + -(btn.y), btn.width, btn.height)
    //     ctx.strokeRect(canvas.width / 2 - (btn.width / 2) + btn.x,
    //      canvas.height / 2 - btn.height / 2 + -(btn.y), btn.width, btn.height)
    //     ctx.fillStyle = 'black'
    //     ctx.fillText(btn.text, canvas.width / 2 - btn.width / 2 + btn.x + btn.width / 2,
    //      canvas.height / 2 - btn.height / 2 + -(btn.y) + btn.height / 2)
    // }
    // for(txt of ui.text){
    //     ctx.fillStyle = txt.color
    //     ctx.textBaseline = 'middle'
    //     ctx.textAlign = 'center'
    //     ctx.font = txt.font_size + 'pt ' + txt.font_family
    //     ctx.fillText(txt.text, canvas.width / 2 + txt.x, canvas.height / 2 + -(txt.y))
    // }

    return {
        //rendering splash frame
        renderMain: function(state){

            console.log('im here also');
            console.log(state);
            console.log(context);

            var state = state;

            context.fillStyle = "rgb(100,100,0)";
            context.fillRect(0, 0, render.width, render.height);

            context.font = "30px Arial";
            context.fillStyle = "blue";
            context.fillText("Start Game", 10, 20);
            context.fillText("Controlls", 10, 50);
            context.fillText("Credits", 10, 80);

            window.addEventListener('keypress', (event) => {
                console.log(event.keyCode);
                if(event.keyCode == 32) {
                    console.log("key32 is pressed");
                    stateManager.setView('racer');
                    RenderManager();
                }
              }, { once: true });
        },
        renderCredits: function(state){

            console.log('im here also');
            console.log(state);
            console.log(context);

            var state = state;

            context.fillStyle = "rgb(100,100,0)";
            context.fillRect(0, 0, render.width, render.height);

            context.font = "30px Arial";
            context.fillStyle = "blue";
            context.fillText("Credits:", 10, 20);
            context.fillText("code, art: David Barta", 10, 50);

            window.addEventListener('keypress', (event) => {
                console.log(event.keyCode);
                if(event.keyCode == 32) {
                    console.log("key32 is pressed");
                    stateManager.setView('racer');
                    RenderManager();
                }
              }, { once: true });
        },
        renderControlls: function(state){

            console.log('im here also');
            console.log(state);
            console.log(context);

            var state = state;

            context.fillStyle = "rgb(100,100,0)";
            context.fillRect(0, 0, render.width, render.height);

            context.font = "30px Arial";
            context.fillStyle = "blue";
            context.fillText("nstructions:", 10, 20);
            context.fillText("space to start, arrows to drive", 10, 50);

            window.addEventListener('keypress', (event) => {
                console.log(event.keyCode);
                if(event.keyCode == 32) {
                    console.log("key32 is pressed");
                    stateManager.setView('racer');
                    RenderManager();
                }
              }, { once: true });
        },

        }
    }
());

export default Menu;
