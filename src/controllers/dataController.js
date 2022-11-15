var dataController = (function(){
  
    return {
    // save chapter numbert into the browser storage
    saveState: function(state) {
        localStorage.setItem('state', JSON.stringify(state));
        console.log(JSON.stringify(state));
      },
    
    // load chapter numbert from the browser storage
    loadState: function() {
        console.log(JSON.parse(localStorage.getItem('state')));
        return JSON.parse(localStorage.getItem('state'));
      },
    }

}
());

export default dataController;