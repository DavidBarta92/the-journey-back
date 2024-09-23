import gameCanvas from '../models/gameCanvas';
import { Menu, Story } from '../models/clickView';
import { Driver } from '../models/driverView';
import inputController from './inputController';
import stateManager from './stateManager';
import { Slide } from '../models/slideView';
import { Map } from '../models/mapView';

    inputController.init();

var RenderManager = (function(){

    window.addEventListener('resize', () => {
        gameCanvas.resize();
    }, true);

    var state = stateManager.loadState();

  return {
      render: function(){
        state = stateManager.loadState();

        switch(state.view){
          case 'menu':
            Menu.render(state);
            break;
          case 'driver':
            Driver.start(state);
            break;
          case 'slide':
            Slide.start(state);
            break;
          case 'map':
            Map.start(state);
            break;
          case 'story':
            Story.render(state);
            break;
          default:
            console.error('Unexpected view:', state.view);
            break;
        }
      },
      
      preRender: function(){
        state = stateManager.loadState();
        Menu.preRender(state);
      },
    }
}
());

export default RenderManager;