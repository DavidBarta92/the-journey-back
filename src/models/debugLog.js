import dataController from "../controllers/dataController";

var D = (function(){

    var state;
    try {
        
        state = dataController.loadState(); 
    } catch (error) {
        console.error(error);
        var state = null;
    }

    return {
        log: function(writable, separator = ""){
            if (Array.isArray(writable)) {
                try {
                    if(state.debugMode){
                        console.log(writable.join(separator));
                    }   
                } catch (error) {
                    console.error(error);
                }
            }
        },

        warn: function(message){
            console.warn(message);
        },

        error: function(error){
            console.error(error);
        },
        
    }
}
());

export default D;




