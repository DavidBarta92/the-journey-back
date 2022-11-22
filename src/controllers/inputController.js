var inputController = (function(){

    var init = function () {
    window.addEventListener('click', (event) => {
            //hitArea(event, buttons, state, context);
    });
    }

    return {
    init: function() {
        init();
        },

    getActualKey: function() {
        var actualKey;
        window.addEventListener('keypress', (event) => {
            console.log(event.keyCode);
            actualKey = event;
          });
        return actualKey;
        },
    }
}
());

export default inputController;