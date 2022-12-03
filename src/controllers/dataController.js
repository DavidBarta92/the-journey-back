import fs from 'fs';
import path from 'path';

var dataController = (function(){

  let catalogue = {
    desert: require('../views/driver/desert.json'),
    controlls: require('../views/menu/controlls.json'),
    credits: require('../views/menu/credits.json'),
    main: require('../views/menu/main.json'),
    L1_C1_S1: require('../views/story/slideShows/L1_C1_S1.json'),
    train: require('../views/story/train.json')
  };
  
    return {
    // save chapter numbert into the browser storage
    saveState: function(state) {
        localStorage.setItem('state', JSON.stringify(state));
        console.log(JSON.stringify(state));
      },
    
    // load chapter numbert from the browser storage
    loadState: function() {
        console.log(JSON.parse(localStorage.getItem('state')));
        return JSON.parse(localStorage.getItem('state'));
      },

    // load font to the document
    addFonts: function(){
      var myFont = new FontFace('myFont', 'url(../../media/fonts/Peace_Sans_Webfont.ttf)');
      myFont.load().then(function(font){
        //if this is ommited won't work
        document.fonts.add(font);
        console.log('Font loaded');
        });
        return myFont;
      },
    
    // if the state content field matches with any field of the catalogue, load it
    loadContent: function(state) {
      return catalogue[state.content];
      },

    loadImage: function(imagePath) {
      var base64img;
      var image = new Image();
      try {
        base64img = fs.readFileSync(path.resolve(__dirname, imagePath), 'utf8');;
        image.src = base64img.slice(1);
      } catch (err) {
        console.error(err); 
      }
      return image;
      },
    }

}
());

export default dataController;