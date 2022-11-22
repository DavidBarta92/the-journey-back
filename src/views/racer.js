import gameCanvas from "../models/gameCanvas";
import RenderManager from "../controllers/renderManager";
import stateManager from "../controllers/stateManager";

var Racer = (function(state){
    var state = state;

var context = gameCanvas.getContext();
context.beginPath();
context.strokeStyle = "blue";
context.rect(20, 20, 150, 100);
context.stroke();
context.font = "30px Arial";
context.fillStyle = "blue";
context.fillText("Racer", 10, 50);

window.addEventListener('keypress', (event) => {
    console.log(event.keyCode);
    if(event.keyCode == 32) {
        console.log("key32 is pressed");
        stateManager.setView('menu');
        RenderManager();
    }
  }, { once: true });
})

export default Racer;