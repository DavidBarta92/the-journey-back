import racer from '../view/racer.js';
import story from '../view/story.js';
import menu from '../view/menu.js';

function render(viewType) {

    console.log("Render is working");

    if(viewType === 'racer'){
        racer.start();
    }
    if(viewType === 'story'){
        story();
    }
    if(viewType === 'menu'){
        menu();
    }

}

export default render;