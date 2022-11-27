export const player = {
    position: 10,
    speed: 0,
    acceleration: 0.05,
    deceleration: 0.3,
    breaking: 0.6,
    turning: 5.0,
    posx: 0,
    maxSpeed: 15,


    // Update the car state
    updateCarState: function(lastDelta) {
        window.onkeyup = function (event) {        
        if (Math.abs(lastDelta) > 130){
            if (this.speed > 3) {
                this.speed -= 0.2;
            }
        } else {
            // read acceleration controls
            if (event.keyCode === 38) { // 38 up
                //player.position += 0.1;
                this.speed += this.acceleration;
            } else if (event.keyCode === 40) { // 40 down
                this.speed -= this.breaking;
            } else {
                this.speed -= this.deceleration;
            }
        }
        }
        this.speed = Math.max(this.speed, 0); //cannot go in reverse
        this.speed = Math.min(this.speed, this.maxSpeed); //maximum speed
        this.position += this.speed;
    }

};
