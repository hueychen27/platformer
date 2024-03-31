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

function clamp(num, min, max) {
    return Math.max(Math.min(num, max), min);
}

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
    canJump: true,
    falling: 99
}

const platformRect = {
    green: {
        x: 0,
        y: canvas.height - 100,
        width: canvas.width,
        height: 100,
        type: "rectangle"
    },
    black: {
        x: 200,
        y: 800,
        width: 300,
        height: 50,
        type: "rectangle"
    },
    orange: {
        x: 600,
        y: 700,
        radius: 50,
        type: "circle"
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
        ctx.fillStyle = Object.keys(platformRect)[i];
        if (platformRect[Object.keys(platformRect)[i]].type == "rectangle") {
            ctx.fillRect(platformRect[Object.keys(platformRect)[i]].x, platformRect[Object.keys(platformRect)[i]].y, platformRect[Object.keys(platformRect)[i]].width, platformRect[Object.keys(platformRect)[i]].height)
        }
        if (platformRect[Object.keys(platformRect)[i]].type == "circle") {
            ctx.beginPath();
            ctx.arc(platformRect[Object.keys(platformRect)[i]].x, platformRect[Object.keys(platformRect)[i]].y, platformRect[Object.keys(platformRect)[i]].radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

function checkTouchingSolid() {
    for (let i = 0; i < Object.keys(platformRect).length; i++) {
        const platform = platformRect[Object.keys(platformRect)[i]];
        if (platform.type == "rectangle") {
            if (
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.y + player.height > platform.y &&
                player.y < platform.y + platform.height
            ) {
                return 1;
            }
        }
        if (platform.type == "circle") {
            let dx = Math.abs(platform.x - player.x - player.width / 2);
            let dy = Math.abs(platform.y - player.y - player.height / 2);

            if (dx > (player.width / 2 + platform.radius)) {
                return 0;
            }
            if (dy > (player.height / 2 + platform.radius)) {
                return 0;
            }

            if (dx <= (player.width / 2)) {
                return 1;
            }
            if (dy <= (player.height / 2)) {
                return 1;
            }

            dx = dx - player.width / 2;
            dy = dy - player.height / 2;
            return (dx * dx + dy * dy <= (platform.radius * platform.radius));
        } // Circle-rectangle collision by: https://stackoverflow.com/a/21096179
    }
    return 0;
}

function moveInSteps(steps) {
    player.falling += 0.25;
    for (let i = 0; i < steps; i++) {
        let lastVal = player.x;
        player.x += player.sx / steps;
        let touching = checkTouchingSolid();
        if (touching) {
            checkXCollision(lastVal);
        }
        lastVal = player.y;
        player.y -= player.sy / steps;
        touching = checkTouchingSolid();
        if (touching) {
            checkYCollision(lastVal);
        }
    }
}

function slip() {
    player.y += 2;
    player.x++;
    let touching = checkTouchingSolid();
    if (touching < 1) {
        player.falling = 9;
        player.sx++;
        return;
    }
    player.x -= 2;
    touching = checkTouchingSolid();
    if (touching < 1) {
        player.falling = 9;
        player.sx--;
        return;
    }
    player.y -= 2;
    player.x++;
}

function playerMovementHorizontal() {
    if (rightPressed) {
        player.sx = 5;
    }
    if (leftPressed) {
        player.sx = -5;
    }
}

function playerMovementVertical() {
    if (upPressed) {
        if (player.jumping == 0 && player.falling < 3) {
            player.jumping = 1;
            player.falling = 3;
        }
        if (player.jumping > 0 && player.jumping < player.jumpHeight / player.jumpForce) {
            player.jumping++;
            player.sy = player.jumpForce;
        }
    } else {
        player.jumping = false;
    }
    player.sy -= 0.9;
}

function playerMove() {
    playerMovementVertical();
    playerMovementHorizontal();
    moveInSteps(Math.abs(player.sx) + Math.abs(player.sy));
    player.sx *= 0.92;
    if (player.x < 0) {
        player.x = 0; // Adjust player position to prevent moving outside the left boundary
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width; // Adjust player position to prevent moving outside the right boundary
    }
}

function checkXCollision(lastVal) {
    player.y--;
    let touching = checkTouchingSolid();
    if (touching > 0) {
        player.y--;
        touching = checkTouchingSolid();
        if (touching > 0) {
            player.y += 2;
            player.x = lastVal;
            player.sx = 0;
            return;
        }
        player.sx *= 0.8;
    }
    player.sx *= 0.95;
    slip();
}

function checkYCollision(lastVal) {
    player.y = lastVal;
    if (player.sy > 0) {
        player.sy = 0;
        return;
    }
    if (player.falling > 0) {
        player.falling = 0;
        slip();
    }
    player.sy *= 0.8;
}

function render() {
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function game() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    platforms();
    playerMove();
    render();
    requestAnimationFrame(game)
}
requestAnimationFrame(game)