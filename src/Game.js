import RenderManager from './controllers/renderManager';
import stateManager from './controllers/stateManager';
import Timer from './models/timer';


export function Game() {

    Timer.startTimer();
    stateManager.setView('menu');
    stateManager.setContent('main');
    RenderManager.preRender();

}
