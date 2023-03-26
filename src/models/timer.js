const Timer = (function(){

    var timeInterval;
    var now;
    var gameStartTime;

    //set the current date-time, it uses setInterval in the startTimer method, which is called by the (main) Game class
    //so wo dont need to call it anymore
    const setNow = function(){
        now = new Date();
    }

    // calculate the difference of the current time and the start time
    // if we dont give customTime it uses the startTime has set at the game started
    const calcDiff = function(customTime){
        var startTime;
        if (customTime) { 
            startTime = customTime;
            var customDiff = now.getTime() - startTime.getTime();
            return customDiff;
        } else { 
            startTime = gameStartTime;
            var mainGameDiff = now.getTime() - startTime.getTime();
            return mainGameDiff;
        }
    }

    //convert diff date-time object to min:sec:mili string
    const convertToMinSecMili = function(diff){
        var min;
        var sec;
        var mili;
        min = Math.floor(diff / 60000);
        
        sec = Math.floor((diff - min * 60000) / 1000); 
        if(sec < 10) sec = "0" + sec;
        
        mili = Math.floor(diff - min * 60000 - sec * 1000);
        if(mili < 100) mili = "0" + mili;
        if(mili < 10) mili = "0" + mili;

        var timeString = ""+min+":"+sec+":"+mili;
        return timeString;
    }

    const wait = function(ms){
        var start = new Date().getTime();
        var end = start;
        while(end < start + ms) {
            end = new Date().getTime();
       }
    }
        
    return {
        startTimer: function(){
            gameStartTime = new Date();
            timeInterval = setInterval(setNow, 60);
        },
        getGameRunningTime: function(){
            return convertToMinSecMili(calcDiff());
        },
        getCustomTime: function(customTime){
            return convertToMinSecMili(calcDiff(customTime));
        },
        wait: function(ms){
            return wait(ms);
        },
    }
}
());

export default Timer;