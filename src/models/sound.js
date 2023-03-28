import Timer from "./timer";
import stateManager from "../controllers/stateManager";

const Sound = (function(){

    var fx = new Audio();
    var noise = new Audio();
    var atmo = new Audio();
    var music = new Audio();

    const playFx = function(path){
        fx.src = path;
        fx.play();
    }

    const playNoise = function(path, max = 5000){
        noise.src = path;
        Timer.wait(Math.floor(Math.random() * max));
        noise.play();
    }

    const playAtmo = function(path){
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
            audioElement.play();
            audioElement.volume = stateManager.loadState().volume;
        }
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
        music: function(path){
            playMusic(path);
        },

    }
}
());

export default Sound;