import Timer from "./timer";
import stateManager from "../controllers/stateManager";

const Sound = (function(){

    var fx = new Audio();
    fx.type = "fx";
    
    var noise = new Audio();
    noise.type = "noise";
    
    var atmo = new Audio();
    atmo.type = "atmo";
    
    var music = new Audio();
    music.type = "music";

    let filter;

    const audioContext = new AudioContext();
    let source;

    const playFx = function(path){
        fx.src = path;
        fx.volume = stateManager.loadState().volume;
        fx.play();
    }

    const playNoise = function(path, max = 5000){
        noise.src = path;
        Timer.wait(Math.floor(Math.random() * max));
        noise.volume = stateManager.loadState().volume;
        noise.play();
    }

    const playAtmo = function(path, lowPass = 2000){
        lowPassFilter(atmo, lowPass);
        continuousPlay(path, atmo);
    }

    const playMusic = function(path){
        continuousPlay(path, music);
    }            

    const continuousPlay = function(path, audioElement){
        var pathFileName = path.replace(/^.*[\\\/]/, '');
        var srcFileName = audioElement.src.slice(-pathFileName.length);
        if(srcFileName !== pathFileName){
            while(audioElement.volume > 0){
                audioElement.volume = (audioElement.volume -= 0.1).toFixed(1);
                Timer.wait(41);
            }

            audioElement.src = path;
            audioElement.volume = stateManager.loadState().volume;
            audioElement.play(); 
        }
    }

    const lowPassFilter = function(audioElement, lowPass = 2000){
        if(!source) {
            source = audioContext.createMediaElementSource(audioElement);
        }
        filter = audioContext.createBiquadFilter();
        source.disconnect(0);
        filter.disconnect(0);
        filter.type = "lowpass";
        filter.frequency.value = lowPass; // Adjust the cutoff frequency as needed
        source.connect(filter);
        filter.connect(audioContext.destination);
    }
        
    return {
        fx: function(path){
            playFx(path);
        },
        noise: function(path){
            playNoise(path);
        },
        atmo: function(path){
            playAtmo(path);
        },
        menuAtmo: function(){
            var path = stateManager.loadState().status.atmoPath;
            playAtmo(path, 300);
        },
        music: function(path){
            playMusic(path);
        },

    }
}
());

export default Sound;