import gameCanvas from '../models/gameCanvas';
import dataController from './dataController';

var stateManager = (function(){

  const initialState = {
    content: 'startScreen', // 'main', 'credits', 'controlls'
    view: 'menu', // 'menu', 'driver', 'story'
    status: {
      content: 'startScreen',
      view: 'menu'
    },
    chapter: 0,
    scene: 0,
    language: 'eng', // 'hun', 'eng'
    items: {
      one: 'one',
      two: null,
      three: null,
      four: null,
      five: null
    },
    volume: 1,
    init: true
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
        console.warn('There is no state in the local storage!');
        return initialState;
      }
    } catch (error) {
      console.warn('inner load state fail');
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
      if (state.view !== 'menu') state.status.content = content;
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
      if (view !== 'menu') state.status.view = view; 
      dataController.saveState(state);
      gameCanvas.clear();
      if (oldView !== state.view){
        console.log('The old view: ' + oldView + ' has changed to: ' + state.view);
      }
    },
  resetLevelChapterScene: () => {
      state = loadState();
      state.level = 1;
      state.chapter = 1;
      state.scene = 1;
      dataController.saveState(state);
      console.log("level: " + state.level + " | chapter: " + state.chapter + " | scene: " + state.scene);
    },
  setChapter: (num) => {
      state = loadState();
      state.chapter = num;
      dataController.saveState(state);
      console.log(state.chapter);
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
  setContentByStatus: () => {
      state = loadState();
      var oldView = state.view; 
      state.view = state.status.view;
      var oldContent = state.content; 
      state.content = state.status.content;
      dataController.saveState(state);
      gameCanvas.clear();
      if (oldView !== state.view){
        console.log('The old view: ' + oldView + ' has changed to: ' + state.view);
      }
      if (oldContent !== state.content){
        console.log('The old content: ' + oldContent + ' has changed to: ' + state.content);
      }
    },
  setStatus: () => {
      state = loadState();
      var oldStateView = state.status.view; 
      state.status.view = state.view;
      var oldStateContent = state.status.content; 
      state.status.content = state.content;
      dataController.saveState(state);
      gameCanvas.clear();
      if (oldStateView !== state.status.view){
        console.log('The old status view: ' + oldStateView + ' has changed to: ' + state.status.view);
      }
      if (oldStateContent !== state.status.content){
        console.log('The old status content: ' + oldStateContent + ' has changed to: ' + state.status.content);
      }
    },
  addItem: (item, place) => {
      state = loadState();
      switch(place){
        case 'one':
          state.items.one = item;
          break;
        case 'two':
          state.items.two = item;
          break;
        case 'three':
          state.items.three = item;
          break;
        case 'four':
          state.items.four = item;
          break;
        case 'five':
          state.items.five = item;
          break;
      }
      dataController.saveState(state);
      console.log(state.items);
    },
  deleteItem: (item) => {
      state = loadState();
      delete state.items[state.items.indexOf(item)];
      dataController.saveState(state);
      console.log(state.items);
    },
  resetItems: () => {
      state = loadState();
      state.items = [];
      console.log("State itmes are removed.");
      dataController.saveState(state);
    },
  setVolume: (num) => {
      state = loadState();
      var oldVolume = state.volume; 
      state.volume = num;
      dataController.saveState(state);
      gameCanvas.clear();
      if (oldVolume !== state.view){
        console.log('The volume has changed from ' + oldVolume + ' to ' + state.volume);
      }
    },
  setInitFalse: () => {
      state = loadState();
      state.init = false;
      dataController.saveState(state);
      console.log('The state is not init anymore.');
    }, 
  }
}
());

export default stateManager;
