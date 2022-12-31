import fs from 'fs';
import path from 'path';

var dataController = (function(){

  let catalogue = {
    desert: require('../views/driver/desert.json'),
    controlls: require('../views/menu/controlls.json'),
    credits: require('../views/menu/credits.json'),
    main: require('../views/menu/main.json'),
    newGame: require('../views/menu/newGame.json'),
    L1_C1_S1: require('../views/story/slideShows/L1_C1_S1.json'),
    living_platform: require('../views/story/living_platform.json'),
    cargo_outside: require('../views/story/cargo_outside.json')
  };

  let dialogueFiles = {
    david: require('../views/story/dialogues/david.json')
  };

  let languageFiles = {
    hun: require('../media/languages/hun.json')
  };
  
    return {
    // save chapter numbert into the browser storage
    saveState: function(state) {
        localStorage.setItem('state', JSON.stringify(state));
        //console.log(JSON.stringify(state));
      },
    
    // load chapter numbert from the browser storage
    loadState: function() {
        //console.log(JSON.parse(localStorage.getItem('state')));
        return JSON.parse(localStorage.getItem('state'));
      },
    
    // if the state content field matches with any field of the catalogue, load it
    loadContent: function(state) {
      return catalogue[state.content];
      },

    // if the state language field matches with any field of the language, load it
    loadLanguageFile: function(state) {
      return languageFiles[state.language];
      },

    //load images from media folder, if the path is null or "" in the view template returns an empty image 
    loadImage: function(imagePath) {
      var base64img;
      var image = new Image();
      try {
        if (imagePath == "" || imagePath == null) {
          return image;
        } else {
        base64img = fs.readFileSync(path.resolve(__dirname, imagePath), 'utf8');
        image.src = base64img.slice(0);
        }
      } catch (err) {
        console.error(err); 
      }
      return image;
      },

    loadDialogue: function(dialogueName) {
      try {
        return dialogueFiles[dialogueName];
      } catch (err) {
        console.error(err); 
        return null;
        }
      },

      saveScreenImage: function(dataURL){
        var base64ScreenImg = dataURL.replace("", "");
        localStorage.setItem("lastScreenImage", base64ScreenImg);
      },
      
      getLastScreenImage: function(){
        var image = new Image();
        var lastScreenImage = localStorage.getItem('lastScreenImage');
        image.src = lastScreenImage;
        return image;
      },
    }
  }
());

export default dataController;