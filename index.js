const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

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
        this.position = position
        this.velocity = velocity
        this.radius = 15

    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
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

const pellets = []

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


//Game Levels (can make in tiled)
const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
  ]
function createImage(src) {
    const image = new Image()
    image.src = src
    return image


}

const boundaries = []
map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height* i

                    }, 
                    image: createImage('./pics/pipehorizontal.png')
                }))
                break
            case '|':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height* i

                    }, 
                    image: createImage('./pics/pipeVertical.png')
                }))
                break
            case '1':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height* i

                    }, 
                    image: createImage('./pics/pipecorner1.png')
                }))
                break
            case '2':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height* i

                    }, 
                    image: createImage('./pics/pipecorner2.png')
                }))
                break
            case '3':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height* i

                    }, 
                    image: createImage('./pics/pipecorner3.png')
                }))
                break
            case '4':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height* i

                    }, 
                    image: createImage('./pics/pipecorner4.png')
                }))
                break
            case 'b':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height* i

                    }, 
                    image: createImage('./pics/block.png')
                }))
                break
            case '[':
                boundaries.push(
                    new Boundary({
                    position: {
                        x: j * Boundary.width,
                        y: i * Boundary.height
                    },
                    image: createImage('./pics/capLeft.png')
                    })
                )
                break
            case ']':
                boundaries.push(
                    new Boundary({
                    position: {
                        x: j * Boundary.width,
                        y: i * Boundary.height
                    },
                    image: createImage('./pics/capRight.png')
                    })
                )
                break
            case '_':
                boundaries.push(
                    new Boundary({
                    position: {
                        x: j * Boundary.width,
                        y: i * Boundary.height
                    },
                    image: createImage('./pics/capBottom.png')
                    })
                )
                break
            case '^':
                boundaries.push(
                    new Boundary({
                    position: {
                        x: j * Boundary.width,
                        y: i * Boundary.height
                    },
                    image: createImage('./pics/capTop.png')
                    })
                )
                break
            case '+':
                boundaries.push(
                    new Boundary({
                    position: {
                        x: j * Boundary.width,
                        y: i * Boundary.height
                    },
                    image: createImage('./pics/pipeCross.png')
                    })
                )
                break
            case '5':
                boundaries.push(
                    new Boundary({
                    position: {
                        x: j * Boundary.width,
                        y: i * Boundary.height
                    },
                    color: 'blue',
                    image: createImage('./pics/pipeConnectorTop.png')
                    })
                )
                break
            case '6':
                boundaries.push(
                    new Boundary({
                    position: {
                        x: j * Boundary.width,
                        y: i * Boundary.height
                    },
                    color: 'blue',
                    image: createImage('./pics/pipeConnectorRight.png')
                    })
                )
                break
            case '7':
                boundaries.push(
                    new Boundary({
                    position: {
                        x: j * Boundary.width,
                        y: i * Boundary.height
                    },
                    color: 'blue',
                    image: createImage('./pics/pipeConnectorBottom.png')
                    })
                )
                break
            case '8':
                boundaries.push(new Boundary({
                    position: {
                        x: j * Boundary.width,
                        y: i * Boundary.height
                    },
                    image: createImage('./pics/pipeConnectorLeft.png')
                    })
                )
                break
            case '.':
                pellets.push(new Pellet({
                    position: {
                        x: j * Boundary.width + Boundary.width / 2,
                        y: i * Boundary.height + Boundary.height / 2
                    }
                    })
                )
                break
        }
    
    })
})
function circleCollidesWithRect({
    circle, 
    rectangle
}) {
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height &&
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x &&
        player.position.y + circle.radius + circle.velocity.y >= rectangle.position.y &&
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width
        )
}

function animate(){
    requestAnimationFrame(animate)
    c.clearRect(0,0, canvas.width, canvas.height)
    pellets.forEach((pellet) => {
        pellet.draw()
    })
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
    // player.velocity.y = 0
    // player.velocity.x = 0
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
                player.velocity.y = -5
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
                player.velocity.x = -5
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
                player.velocity.y = 5
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
                player.velocity.x = 5
            }
        }
    }
}
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