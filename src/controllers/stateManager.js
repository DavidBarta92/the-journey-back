import gameCanvas from '../models/gameCanvas';
import dataController from './dataController';

var stateManager = (function(){

  const initialState = {
    content: 'main', // 'main', 'credits', 'controlls'
    view: 'menu', // 'menu', 'driver', 'story'
    status: 'idle',
    level: 0,
    chapter: 0,
    scene: 0,
    language: 'hun', // 'hun', 'eng'
  };

  var state = [];

  // load state from the local storage. if its not possible make a new based on the initialState
  var loadState = function(){
    try {
      state = dataController.loadState();
      var i;
      if (state !== null) {
        for (i in initialState) {
          if (!state.hasOwnProperty(i)) {
            state[i] = initialState[i];
          }
      }
        return state;
      } else {
        console.log('There is no state in the local storage!');
        return initialState;
      }
    } catch (error) {
      console.log('inner load state fail');
      console.error(error + ' There is no state in the local storage!');
      return initialState;
    }

  }
  
  return {
  loadState: () => {
      return loadState();
    },
  setContent: (content) => {
      state = loadState();
      var oldContent = state.content; 
      state.content = content;
      dataController.saveState(state);
      gameCanvas.clear();
      if (oldContent !== state.content){
        console.log('The old content: ' + oldContent + ' has changed to: ' + state.content);
      }
    },
  setView: (view) => {
      state = loadState();
      var oldView = state.view; 
      state.view = view;
      dataController.saveState(state);
      gameCanvas.clear();
      if (oldView !== state.view){
        console.log('The old view: ' + oldView + ' has changed to: ' + state.view);
      }
    },
  newLevel: () => {
      state = loadState();
      state.level += 1;
      state.chapter = 1;
      state.scene = 1;
      dataController.saveState(state);
      console.log(state.level);
    },
  newChapter: () => {
      state = loadState();
      state.chapter += 1;
      state.scene = 1;
      dataController.saveState(state);
      console.log(state.level);
    },
  newScene: () => {
      state = loadState();
      state.scene += 1;
      dataController.saveState(state);
      console.log(state.level);
    },
  changeLanguage: (language) => {
      state = loadState();
      var oldLanguage = state.language; 
      state.language = language;
      dataController.saveState(state);
      if (oldLanguage !== state.language){
        console.log('The old language: ' + oldLanguage + ' has changed to: ' + state.language);
      }
    },
  }
}
());

export default stateManager;
