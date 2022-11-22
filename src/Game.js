import dataStorage from './controllers/dataController';
import RenderManager from './controllers/renderManager';
import stateManager from './controllers/stateManager';


export function Game() {

    stateManager.setView('menu');
    stateManager.setContent('main');
    RenderManager();

}
