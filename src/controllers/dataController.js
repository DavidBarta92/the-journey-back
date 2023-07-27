import fs from 'fs';
import path from 'path';

var dataController = (function(){

  let catalogue = {
    desert: require('../views/driver/desert.json'),
    options: require('../views/menu/options.json'),
    credits: require('../views/menu/credits.json'),
    main: require('../views/menu/main.json'),
    newGame: require('../views/menu/newGame.json'),
    C1_S1: require('../views/story/slideShows/C1/C1_S1.json'),
    C1_S2: require('../views/story/slideShows/C1/C1_S2.json'),
    C1_S3: require('../views/story/slideShows/C1/C1_S3.json'),
    C1_S4: require('../views/story/slideShows/C1/C1_S4.json'),
    C1_S5: require('../views/story/slideShows/C1/C1_S5.json'),
    C1_S6: require('../views/story/slideShows/C1/C1_S6.json'),
    C1_S7: require('../views/story/slideShows/C1/C1_S7.json'),
    C1_S8: require('../views/story/slideShows/C1/C1_S8.json'),
    C1_S9: require('../views/story/slideShows/C1/C1_S9.json'),
    C1_S10: require('../views/story/slideShows/C1/C1_S10.json'),
    C1_S11: require('../views/story/slideShows/C1/C1_S11.json'),
    C1_S12: require('../views/story/slideShows/C1/C1_S12.json'),
    C1_S13: require('../views/story/slideShows/C1/C1_S13.json'),
    C1_S14: require('../views/story/slideShows/C1/C1_S14.json'),
    C1_S15: require('../views/story/slideShows/C1/C1_S15.json'),
    C1_title: require('../views/story/slideShows/C1/C1_title.json'),
    C1_startingbase_enterance: require('../views/story/C1_startingbase_enterance.json'),
    C1_startingbase: require('../views/story/C1_startingbase.json'),
    C1_sunconsoles: require('../views/story/C1_sunconsoles.json'),
    //C1_batteryConnection2num: require('../views/story/C1_batteryConnection2num.json'),
    //C1_batteryConnection29num: require('../views/story/C1_batteryConnection29num.json'),
    //C1_batteryConnection299num: require('../views/story/C1_batteryConnection299num.json'),
    //C1_batteryConnection2991num: require('../views/story/C1_batteryConnection2991numjson'),
    //C1_batteryConnectionWrongnum: require('../views/story/C1_batteryConnectionWrongnum.json'),
    //C1_batteryConnection: require('../views/story/C1_batteryConnection.json'),
    living_platform: require('../views/story/living_platform.json'),
    cargo_outside: require('../views/story/cargo_outside.json')
  };

  let dialogueFiles = {
    david: require('../views/story/dialogues/david.json'),
    C1_S1: require('../views/story/dialogues/C1/C1_S1.json'),
    C1_S4: require('../views/story/dialogues/C1/C1_S4.json'),
    C1_S5: require('../views/story/dialogues/C1/C1_S5.json')
  };

  let languageFiles = {
    hun: require('../media/languages/hun.json'),
    eng: require('../media/languages/eng.json')
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