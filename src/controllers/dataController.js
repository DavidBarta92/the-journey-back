import fs from 'fs';
import path from 'path';

var dataController = (function(){

  function findFileByParameter(startPath, parameterToFind) {
    const files = fs.readdirSync(startPath);
  
    for (const file of files) {
      const filePath = path.join(startPath, file);
  
      // Check if it's a directory
      if (fs.statSync(filePath).isDirectory()) {
        const result = findFileByParameter(filePath, parameterToFind);
        if (result) {
          return result;
        }
      } else {
        if (path.extname(filePath).toLowerCase() === '.json') {
          const content = fs.readFileSync(filePath, 'utf-8');
          const json = JSON.parse(content);
          try {
            if (json.name === parameterToFind) {
              return filePath;
            } 
          } catch (error) {
            
            console.warn('There is an empt json file. ' + filePath);
            return null;
          }
        }
      }
    }
  
    // If no file is found with the specified parameter
    return null;
  }


  function readJsonFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(content);
  
      return json;
    } catch (error) {
      console.error(`Error reading JSON file ${filePath}: ${error.message}`);
      return null;
    }
  }

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
    // save chapter number into the browser storage
    saveState: function(state) {
        localStorage.setItem('state', JSON.stringify(state));
      },
    
    // load chapter number from the browser storage
    loadState: function() {
        return JSON.parse(localStorage.getItem('state'));
      },
    
    // if the state content field matches with any field of the catalogue, load it
    loadContent: function(state) {
      return readJsonFile(findFileByParameter(path.resolve('src/views/'), state.content));
      },

    // if the state language field matches with any field of the language, load it
    loadLanguageFile: function(state) {
      return languageFiles[state.language];
      },

    //load images from media folder, if the path is null or "" in the view template returns an empty image 
    loadImage: function(imagePath) {
      var base64img;
      var image = new Image();
        if (!imagePath) {
          imagePath = '../src/media/images/black.b64';
        }
        try {
          base64img = fs.readFileSync(path.resolve(__dirname, imagePath), 'utf8');
        } catch (error) { 
          console.warn("__dirname is not working!");
          const dirName = localStorage.getItem('dirName');
          base64img = fs.readFileSync(path.resolve(dirName, imagePath), 'utf8');
        }
        image.src = base64img.slice(0);
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
        var lastScreenImage;
        try {
          lastScreenImage = localStorage.getItem('lastScreenImage');
          image.src = lastScreenImage;
        if(!lastScreenImage){
            image = this.loadImage(null);
        }
        } catch (error) {
          image = this.loadImage(null);
        }
        return image;
      },
    }
  }
());

export default dataController;