import Racer from "../views/racer";

var inputController = (function(){

    var keys = [];

    var init = function () {

    // window.addEventListener('click', (event) => {
    //     console.log("X:" + event.offsetX + " | Y:" + event.offsetY);
    // });
    // window.addEventListener('keydown', (event) => {
    //     console.log(event);
    // });

    window.onkeydown = function (event) { 
        if(event.keyCode == 32){
            Racer.exit();
        }
            Racer.updateCarState();
    }
    //register key handeling:
    window.onkeydown = function (event) {
        keys[event.keyCode] = true;
    };
    window.onkeyup = function (event) {
        keys[event.keyCode] = false;
    };
    }

    return {
    init: function() {
        init();
    },

    getActualKey: function() {
        var actualKey;
        window.addEventListener('keypress', (event) => {
            console.log(event);
            actualKey = event;
          });
        return actualKey;
    },

    getKeys: function(){
        return keys;
    },
    }
}
());

export default inputController;