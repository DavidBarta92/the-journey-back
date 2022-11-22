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

    //load font to the document
    addFonts: function(){
      var myFont = new FontFace('myFont', 'url(../../media/fonts/Peace_Sans_Webfont.ttf)');
      myFont.load().then(function(font){
        //if this is ommited won't work
        document.fonts.add(font);
        console.log('Font loaded');
        });
        return myFont;
      }
    }

}
());

export default dataController;