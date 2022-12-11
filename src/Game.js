import RenderManager from './controllers/renderManager';
import stateManager from './controllers/stateManager';


export function Game() {

    stateManager.setView('menu');
    stateManager.setContent('main');
    setTimeout(RenderManager.render(), 1600);

}
