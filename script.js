/**
 * @type {HTMLCanvasElement}
 */
let canvas = document.getElementById('canva');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
/**
 * @type {CanvasRenderingContext2D}
 */
let ctx = canvas.getContext('2d');
const player = {
    x: 0,
    y: 0,
    sx: 0,
    sy: 0,
    width: 30,
    height: 30,
    jumpForce: 15,
    jumping: false,
    jumpHeight: 100,
    jumpTime: 0,
    collided: false
}

const platformRect = {
    ground: {
        x: 0,
        y: canvas.height - 100,
        width: canvas.width,
        height: 100
    }
}

let leftPressed = false;
let rightPressed = false;
let upPressed = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (event.key === 'ArrowRight') {
        rightPressed = true;
    } else if (event.key === 'ArrowUp') {
        upPressed = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (event.key === 'ArrowRight') {
        rightPressed = false;
    } else if (event.key === 'ArrowUp') {
        upPressed = false;
    }
});

function platforms() {
    for (let i = 0; i < Object.keys(platformRect).length; i++) {
        ctx.fillRect(platformRect[Object.keys(platformRect)[i]].x, platformRect[Object.keys(platformRect)[i]].y, platformRect[Object.keys(platformRect)[i]].width, platformRect[Object.keys(platformRect)[i]].height)
    }
}

function playerMovement() {
    if (rightPressed) {
        player.sx = 5;
    }
    if (leftPressed) {
        player.sx = -5;
    }
    if (upPressed && !player.jumping && player.collided) {
        player.jumping = true;
        player.jumpTime = 0;
        player.sy = player.jumpForce;
    }
    if (player.jumping && upPressed) {
        player.jumpTime += 1;
        player.sy = player.jumpForce;
    }
    if (player.jumpTime > player.jumpHeight / player.jumpForce) {
        player.jumping = false;
        player.jumpTime = 0;
    }
    if (!upPressed) {
        player.jumping = false;
        player.jumpTime = 0;
    }
    player.x += player.sx;
    player.y -= player.sy;
    player.sx *= 0.92;
    player.sy *= 0.98;
    player.sy--;
}

function checkCollision() {
    for (let i = 0; i < Object.keys(platformRect).length; i++) {
        const rect = platformRect[Object.keys(platformRect)[i]];
        if (
            player.x < rect.x + rect.width &&
            player.x + player.width > rect.x &&
            player.y < rect.y + rect.height &&
            player.y + player.height > rect.y
        ) {
            player.y = rect.y - player.height;
            player.sy = 0;
            player.collided = true;
        } else {
            player.collided = false;
        }
    }
}

function render() {
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function game() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    platforms();
    playerMovement();
    checkCollision();
    render();
    requestAnimationFrame(game)
}
requestAnimationFrame(game)