import gameCanvas from '../models/gameCanvas';
import Menu from '../views/menu';
import Racer from '../views/racer';
import Story from '../views/story';
import stateManager from './stateManager';


var RenderManager = (function(){
    //gameCanvas.clear();

    window.addEventListener('resize', () => {
        gameCanvas.resize();
    }, true);

    var state = stateManager.loadState();

  switch(state.view){
    case 'menu':
      console.log('menu');
      switch(state.content){
        case 'main':
          Menu.renderMain(state);
          break;
        case 'credits':
          Menu.renderCredits(state);
          break;
        case 'controlls':
          Menu.renderControlls(state);
          break;
      }
      break;
    case 'racer':
      console.log('racer');
      Racer(state);
      break;
    case 'story':
      console.log('story');
      Story(state);
      break;
  }
})

export default RenderManager;