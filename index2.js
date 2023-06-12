const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const scoreEl = document.querySelector('#scoreEl')

canvas.width = innerWidth
canvas.height = innerHeight
let gameFrozen = false;

class Boundary {
    static width = 40
    static height = 40
    constructor({position, image}) {
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }
    draw(){
        // c.fillStyle = 'blue'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.drawImage(this.image, this.position.x, this.position.y)

    }
}
class Player {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.speed = 5
        this.radius = 15;
        this.radians = 0.75;
        this.openRate = 0.12;
        this.rotation = 0;
        this.dying = false;
        this.dyingRate = 0.02; // You can adjust this rate for the desired speed of dying animation
    }

    draw() {
        c.save();
        c.translate(this.position.x, this.position.y);
        c.rotate(this.rotation);
        c.translate(-this.position.x, -this.position.y);
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0 + this.radians, Math.PI * 2 - this.radians);
        c.lineTo(this.position.x, this.position.y);
        c.fillStyle = 'yellow';
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();
        if (this.dying) {
            if (this.radians < 3) {
                player.rotation = Math.PI*1.5
                this.radians += this.dyingRate;
            } else {
                // take game over action when dying animation is complete
                cancelAnimationFrame(animationId);
                console.log('You Lose!!');
            }
        } else {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;

            if (this.radians < 0 || this.radians > 0.75) {
                this.openRate = -this.openRate;
            }

            this.radians += this.openRate;
        }
    }
}

class Ghost {
    static speed = 2;
    constructor({position, velocity, color= 'red'}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.color = color;
        this.prevCollisions = [];
        this.speed = 2;
        this.scared = false;
        this.scaredEndTime = 0;
        this.flashing = false;
        this.flashingInterval = null;
    }

    draw() {
        c.fillStyle = this.flashing ? 'white' : this.scared ? 'blue' : this.color;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        if (!gameFrozen) {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }
}
class Pellet {
    constructor({position }) {
        this.position = position
        this.radius = 3

    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }

}
class PowerUp {
    constructor({position }) {
        this.position = position
        this.minRadius = 3;
        this.maxRadius = 8;
        this.radius = this.minRadius;
        this.growing = true;
        this.growthRate = 0.3;  // Adjust as necessary for faster/slower growth

    }
    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'white';
        c.fill();
        c.closePath();
        this.update()
    }
    update() {
        if (this.growing) {
            this.radius += this.growthRate;
            if (this.radius >= this.maxRadius) {
                this.growing = false;
            }
        } else {
            this.radius -= this.growthRate;
            if (this.radius <= this.minRadius) {
                this.growing = true;
            }
        }
    }

}

const pellets = []
const powerUps = []

//create ghosts instance
const ghosts = [
new Ghost({
    position: {
        x: Boundary.width * 8 + Boundary.width * 0.5,
        y: Boundary.height * 14 + Boundary.height * 0.5
    },
    velocity: {
        x: Ghost.speed,
        y: 0
    }
}),
new Ghost({
    position: {
        x: Boundary.width * 12 + Boundary.width * 0.5,
        y: Boundary.height* 14 + Boundary.height * 0.5
    },
    velocity: {
        x: Ghost.speed,
        y: 0
    }, 
    color: 'pink'
}),
new Ghost({
    position: {
        x: Boundary.width * 14 + Boundary.width * 0.5,
        y: Boundary.height* 8 + Boundary.height * 0.5
    },
    velocity: {
        x: Ghost.speed,
        y: 0
    }, 
    color: 'orange'
}),
new Ghost({
    position: {
        x: Boundary.width * 10 + Boundary.width * 0.5,
        y: Boundary.height *11+ Boundary.height * 0.5
    },
    velocity: {
        x: Ghost.speed,
        y: 0
    }, 
    color: 'aqua'
})
]

//create player instance
const player = new Player({
    position: {
        x: Boundary.width + Boundary.width * 0.5,
        y: Boundary.height + Boundary.height * 0.5
    },
    velocity: {
        x: 0,
        y: 0
    }
})
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

let lastKey = ''
let score = 0

//Game Levels (can make in tiled)
const map = [
    ['10','15','15','15','15','15','15','15','15','15','15','15','15','15','15','15','15','15','15','15','11'],
    ['16','.','.','.','.','.','.','2','15','15','15','15','15','3','.','.','.','.','.','p','16'],
    ['16','.','10','5','5','11','.','.','.','.','.','.','.','.','.','10','5','5','11','.','16'],
    ['16','.','13','9','9','12','.','4','.','2','15','3','.','4','.','13','9','9','12','.','16'],
    ['16','.','.','.','.','.','.','1','.','.','.','.','.','1','.','.','.','.','.','.','16'],
    ['16','.','2','15','15','3','.','.','.','2','15','3','.','.','.','2','15','15','3','.','16'],
    ['16','.','.','.','.','.','.','4','.','.','.','.','.','4','.','.','.','.','.','.','16'],
    ['16','3','.','2','3','.','2','14','3','.','0','.','2','14','3','.','2','3','.','0','16'],
    ['16','.','.','.','.','.','.','1','.','.','.','.','.','1','.','.','.','.','.','.','16'],
    ['16','.','2','15','15','3','.','.','.','2','5','3','.','.','.','2','15','15','3','.','16'],
    ['16','.','.','.','.','.','.','4','.','.','1','.','.','4','.','.','.','.','.','.','16'],
    ['16','.','2','15','3','.','2','9','3','.','.','.','2','9','3','.','2','15','3','.','16'],
    ['16','.','.','.','.','.','.','.','.','.','4','.','.','.','.','.','.','.','.','.','16'],
    ['16','0','.','0','.','0','.','0','.','2','14','3','.','0','.','0','.','0','.','0','16'],
    ['16','.','.','.','.','.','.','.','.','.','1','.','.','.','.','.','.','.','.','.','16'],
    ['16','.','0','.','10','11','.','10','11','.','.','.','10','11','.','10','11','.','0','.','16'],
    ['16','.','.','.','13','12','.','8','9','3','.','2','9','7','.','13','12','.','.','.','16'],
    ['16','.','4','.','.','.','.','1','.','.','.','.','.','1','.','.','.','.','4','.','16'],
    ['16','.','1','.','2','3','.','.','.','2','15','3','.','.','.','2','3','.','1','.','16'],
    ['16','p','.','.','.','.','.','0','.','.','.','.','.','0','.','.','.','.','.','p','16'],
    ['13','15','15','15','15','15','15','15','15','15','15','15','15','15','15','15','15','15','15','15','12']
  ]
  
function createImage(src) {
    const image = new Image()
    image.src = src
    return image
}

const boundaryFactory = {
    '0': './pics/block.png',
    '1': './pics/capBottom.png',
    '2': './pics/capLeft.png',
    '3': './pics/capRight.png',
    '4': './pics/capTop.png',
    '5': './pics/pipeConnectorBottom.png',
    '6': './pics/pipeConnectorDownwards.png',
    '7': './pics/pipeConnectorLeft.png',
    '8': './pics/pipeConnectorRight.png',
    '9': './pics/pipeConnectorTop.png',
    '10': './pics/pipecorner1.png',
    '11': './pics/pipecorner2.png',
    '12': './pics/pipecorner3.png',
    '13': './pics/pipecorner4.png',
    '14': './pics/pipeCross.png',
    '15': './pics/pipehorizontal.png',
    '16': './pics/pipeVertical.png',
  };
  

const boundaries = []

map.forEach((row, i) => {
    row.forEach((symbol, j) => {
      const position = {
        x: Boundary.width * j,
        y: Boundary.height * i
      };
  
      if (boundaryFactory.hasOwnProperty(symbol)) {
        boundaries.push(
          new Boundary({
            position,
            image: createImage(boundaryFactory[symbol])
          })
        );
      } else if (symbol === '.') {
        pellets.push(
          new Pellet({
            position: {
              x: position.x + Boundary.width / 2,
              y: position.y + Boundary.height / 2
            }
          })
        );
      } else if (symbol === 'p') {
        powerUps.push(
          new PowerUp({
            position: {
              x: position.x + Boundary.width / 2,
              y: position.y + Boundary.height / 2
            }
          })
        );
      }
    });
  });
  

function circleCollidesWithRect({circle,rectangle}) {
    const padding = Boundary.width * 0.5 - circle.radius - 1
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding &&
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding &&
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y -padding &&
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding
        )
}

let animationId
function animate(){
    animationId = requestAnimationFrame(animate)
    c.clearRect(0,0, canvas.width, canvas.height)

    // collision detection
    for (let i = ghosts.length - 1; 0 <= i; i--) {
        const ghost = ghosts[i];
        // ghost touches player 
        if (Math.hypot(ghost.position.x - player.position.x, ghost.position.y - player.position.y) < ghost.radius + player.radius) { 
            if (ghost.scared){
                ghosts.splice(i, 1);
            } else {
                player.dying = true;
                gameFrozen = true; // freeze game when player is dying
            }
        }
    }

    //powerup collisions
    for (let i = powerUps.length - 1; 0 <= i; i--) {
        const powerUp = powerUps[i];
        powerUp.draw();

        if (Math.hypot(powerUp.position.x - player.position.x, powerUp.position.y - player.position.y) < powerUp.radius + player.radius) {
            powerUps.splice(i, 1);

            ghosts.forEach(ghost => {
                ghost.scared = true;
                ghost.scaredEndTime = Date.now() + 7000; // set end time

                // start the flashing interval
                ghost.flashingInterval = setInterval(() => {
                    if (Date.now() > ghost.scaredEndTime - 3500) {
                        ghost.flashing = !ghost.flashing;
                    }
                }, 300); // adjust this value to control the speed of flashing

                setTimeout(() => {
                    ghost.scared = false;
                    // clear the flashing interval when the ghost is no longer scared
                    clearInterval(ghost.flashingInterval);
                    ghost.flashing = false;
                }, 7000);
            });
        }
    }
    //pellet collisions
    for (let i = pellets.length - 1; 0 <= i; i--) {
        const pellet = pellets[i]
        pellet.draw()
        
        if (Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y) < pellet.radius + player.radius) {
            pellets.splice(i, 1)
            score += 10
            scoreEl.innerHTML = score
        }
    }

    //end all pellets win conditions
    if (pellets.length === 0) {
        console.log('You Win!!')
        cancelAnimationFrame()
    }


    boundaries.forEach((boundary) => {
        boundary.draw()

        if (circleCollidesWithRect({
            circle: player, 
            rectangle: boundary
        })) {
                player.velocity.x = 0
                player.velocity.y = 0
            }
    })
    player.update()

    ghosts.forEach(ghost => {
        ghost.update()

        

        const collisions = []
        boundaries.forEach(boundary => {
            if (
                !collisions.includes('right') &&
                circleCollidesWithRect({
                circle: {...ghost, 
                    velocity: {
                    x: ghost.speed,
                    y: 0
                }}, 
                rectangle: boundary
            })) {
                collisions.push('right')
            }
            if (
                !collisions.includes('left') &&
                circleCollidesWithRect({
                circle: {...ghost, 
                    velocity: {
                    x: -ghost.speed,
                    y: 0
                }}, 
                rectangle: boundary
            })) {
                collisions.push('left')
            }
            if (
                !collisions.includes('up') &&
                circleCollidesWithRect({
                circle: {...ghost, 
                    velocity: {
                    x: 0,
                    y: -ghost.speed
                }}, 
                rectangle: boundary
            })) {
                collisions.push('up')
            }
            if (
                !collisions.includes('down') &&
                circleCollidesWithRect({
                circle: {...ghost, 
                    velocity: {
                    x: 0,
                    y: ghost.speed
                }}, 
                rectangle: boundary
            })) {
                collisions.push('down')
            }
        })
        //ghosts ai movement functionality
        if (collisions.length > ghost.prevCollisions.length)
        ghost.prevCollisions = collisions

        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
            // console.log('gogo')

            if (ghost.velocity.x > 0) ghost.prevCollisions.push('right')
            else if (ghost.velocity.x < 0) ghost.prevCollisions.push('left')
            else if (ghost.velocity.y < 0) ghost.prevCollisions.push('up')
            else if (ghost.velocity.y > 0) ghost.prevCollisions.push('down')

            const pathways = ghost.prevCollisions.filter(collision => {
                return !collisions.includes(collision)
            })
            console.log({pathways})
            const direction = pathways[Math.floor(Math.random() * pathways.length)]
            //ghosts ai movement functionality
            switch (direction) {
                case 'down':
                    ghost.velocity.y = ghost.speed
                    ghost.velocity.x = 0
                    break
                case 'up':
                    ghost.velocity.y = -ghost.speed
                    ghost.velocity.x = 0
                    break
                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = ghost.speed
                    break
                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -ghost.speed
                    break
            }
            ghost.prevCollisions = []
        }
    })

    if (keys.w.pressed && lastKey === 'w') { 
        for (let i =0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRect({
                circle: {...player, velocity: {
                    x: 0,
                    y: -5
                }}, 
                rectangle: boundary
            })) {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = -player.speed
            }
        }
    } else if (keys.a.pressed && lastKey === 'a') {
        for (let i =0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRect({
                circle: {...player, velocity: {
                    x: -5,
                    y: 0
                }}, 
                rectangle: boundary
            })) {
                player.velocity.x = 0
                break
            } else {
                player.velocity.x = -player.speed
            }
        }
    } else if (keys.s.pressed && lastKey === 's') {
        for (let i =0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRect({
                circle: {...player, velocity: {
                    x: 0,
                    y: 5
                }}, 
                rectangle: boundary
            })) {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = player.speed
            }
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        for (let i =0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRect({
                circle: {...player, velocity: {
                    x: 5,
                    y: 0
                }}, 
                rectangle: boundary
            })) {
                player.velocity.x = 0
                break
            } else {
                player.velocity.x = player.speed
            }
        }
    }

    if (player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI
    else if (player.velocity.y < 0) player.rotation = Math.PI*1.5
    else if (player.velocity.y > 0) player.rotation = Math.PI*0.5

} // end of animate
animate()

addEventListener('keydown', ({key}) => {
    switch (key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
        break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
        break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
        break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
        break
    }
})
addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'w':
            keys.w.pressed = false
        break
        case 'a':
            keys.a.pressed = false
        break
        case 's':
            keys.s.pressed = false
        break
        case 'd':
            keys.d.pressed = false
        break
    }
})