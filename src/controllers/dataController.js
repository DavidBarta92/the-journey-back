import fs from 'fs';
const path = require("path");
const { ipcRenderer } = require('electron');

var dataController = (function () {

  /**
   * Recursively finds a JSON file by a specified parameter within a directory.
   * @param {string} startPath The starting path for the search.
   * @param {string} parameterToFind The parameter to match in the JSON file.
   * @return {string|null} The path of the found JSON file, or null if not found.
   */
  function findFileByParameter(startPath, parameterToFind) {
    const files = fs.readdirSync(path.join(startPath));
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
            console.warn('There is an empty json file. ' + filePath);
            return null;
          }
        }
      }
    }

    // If no file is found with the specified parameter
    return null;
  }

  /**
   * Reads and parses JSON content from a file.
   * @param {string} filePath The path of the JSON file to read.
   * @return {Object|null} The parsed JSON object, or null if an error occurs.
   */
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

  /**
   * Reads and parses JSON content from a file.
   * @return {Object|null} The path of the main folder stored in memory.
   */
  function getPath() {
    const data = ipcRenderer.sendSync('load-data');
    return data.mainFolder;
  }
  
  /**
   * Reads and parses JSON content from a file.
   * @param {string} directories The name of the JSON file's folders
   * @return {Object|null} The full path to the given folder.
   */
  function resolvePath(directories) {
    const mainPath = getPath();
    return mainPath + "/" + directories;
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
    /**
     * Saves the state (chapter number) into browser storage.
     * @param {Object} state The state object to save.
     */
    saveState: function (state) {
      localStorage.setItem('state', JSON.stringify(state));
    },

    /**
     * Loads the chapter number from browser storage.
     * @return {Object} The loaded state object.
     */
    loadState: function () {
      return JSON.parse(localStorage.getItem('state'));
    },

    /**
     * Loads JSON content based on the state's content field matching any field of the catalog.
     * @param {Object} state The state object containing the content field.
     * @return {Object|null} The loaded JSON content, or null if not found or an error occurs.
     */
    loadContent: function (state) {
        return readJsonFile(findFileByParameter(resolvePath('src/views/'), state.content));
    },

    /**
     * Loads a language file based on the state's language field matching any field of the language files.
     * @param {Object} state The state object containing the language field.
     * @return {Object|null} The loaded language file, or null if not found.
     */
    loadLanguageFile: function (state) {
      return languageFiles[state.language];
    },

    /**
     * Loads images from the media folder; if the path is null or "", returns an empty image.
     * @param {string} imagePath The path of the image to load. (needs to be b64, png or jpg image)
     * @return {Image} The loaded Image object.
     */
    loadImage: function (imagePath) {
      var image = new Image();
      var base64img;
      if (!imagePath) imagePath = '../src/media/images/black.b64';
      const extension = path.extname(imagePath);
      try {
        if (extension === '.b64') {
          base64img = fs.readFileSync(path.resolve(__dirname, imagePath), 'utf8')
          image.src = base64img.slice(0);
        } else if (extension === '.png' || extension === '.jpg') {
          const objectURL = imagePath;
          image.src = objectURL;
        } else {
          throw new Error(`Unsupported image format: ${extension}`);
        }
      } catch (error) {
        const dirName = localStorage.getItem('dirName')
        if (extension === '.b64') {
          console.warn('__dirname is not working!')
          base64img = fs.readFileSync(path.resolve(dirName, imagePath), 'utf8')
          image.src = base64img.slice(0)
        } else if (extension === '.png' || extension === '.jpg') {
          const objectURL = imagePath;
          image.src = objectURL;
        }
      }
      return image
    },

    /**
     * Loads a preloaded dialogue by name.
     * @param {string} dialogueName The name of the dialogue to load.
     * @return {Object|null} The loaded dialogue object, or null if not found.
     */
    loadDialogue: function (dialogueName) {
      try {
        return dialogueFiles[dialogueName];
      } catch (err) {
        console.error(err);
        return null;
      }
    },

    /**
     * Saves a screen image data URL to browser storage.
     * @param {string} dataURL The data URL of the screen image.
     */
    saveScreenImage: function (dataURL) {
      var base64ScreenImg = dataURL.replace('', '');
      localStorage.setItem('lastScreenImage', base64ScreenImg);
    },

    /**
     * Gets the last saved screen image as an Image object.
     * @return {Image} The Image object representing the last screen image.
     */
    getLastScreenImage: function () {
      var image = new Image();
      var lastScreenImage;
      try {
        lastScreenImage = localStorage.getItem('lastScreenImage');
        image.src = lastScreenImage;
        if (!lastScreenImage) {
          image = this.loadImage(null);
        }
      } catch (error) {
        image = this.loadImage(null);
      }
      return image;
    }
  };
})();

export default dataController;
