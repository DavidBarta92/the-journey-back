export const player = {
    position: 10,
    speed: 0,
    acceleration: 0.05,
    deceleration: 0.3,
    breaking: 0.6,
    turning: 8.0,
    posx: 0,
    posy: 0,
    maxSpeed: 5,
    delta: 0,

    // Update the car state
    updateCarState: function(baseOffset) {
        player.delta = player.posx - baseOffset * 2;
      
        if (Math.abs(player.delta) > 130 && player.speed > 3) {
          player.speed -= 0.2;
        }
      
        return player.delta;
    }

};
