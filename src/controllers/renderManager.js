import gameCanvas from '../models/gameCanvas';
import { Menu, Story } from '../models/clickView';
import Driver from '../models/driverView';
//import Story from '../views/story/story';
import inputController from './inputController';
import stateManager from './stateManager';

var RenderManager = (function(){

    inputController.init();

    window.addEventListener('resize', () => {
        gameCanvas.resize();
    }, true);

    var state = stateManager.loadState();

  switch(state.view){
    case 'menu':
      Menu.render(state);
      break;
    case 'driver':
      Driver.start(state);
      break;
    case 'story':
      Story(state);
      break;
  }
})

export default RenderManager;