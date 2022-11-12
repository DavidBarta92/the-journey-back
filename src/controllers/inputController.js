var inputController = (function(){

    return {
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