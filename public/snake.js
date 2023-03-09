const socket = io();

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const score = document.getElementById("score");

const BLOCK_SIZE = 10;
const NUM_BLOCKS = 40;
const WIDTH = BLOCK_SIZE * NUM_BLOCKS;
const HEIGHT = BLOCK_SIZE * NUM_BLOCKS;
canvas.width = WIDTH;
canvas.height = HEIGHT;

let playerNumber;
let snake;
let fruit;
let gameLoop;
let scoreValue = 0;

socket.on("connect", () => {
    console.log("Connected to server.");
});

socket.on("playerNumber", (num) => {
    playerNumber = num;
});

socket.on("gameState", (state) => {
    snake = state.snake;
    fruit = state.fruit;
    scoreValue = state.score;
});

socket.on("gameOver", () => {
    clearInterval(gameLoop);
    alert("Game over!");
});

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawSnake() {
    snake.forEach((block) => {
        drawBlock(block.x, block.y, "#66ff66");
    });
}

function drawFruit() {
    drawBlock(fruit.x, fruit.y, "#ff6666");
}

function drawScore() {
    score.innerHTML = `Score: ${scoreValue}`;
}

function updateGameState(direction) {
    socket.emit("updateDirection", direction);
}

document.addEventListener("keydown", (event) => {
    const keyCode = event.keyCode;
    let direction;

    switch (keyCode) {
        case 37: // left arrow
            direction = "left";
            break;
        case 38: // up arrow
            direction = "up";
            break;
        case 39: // right arrow
            direction = "right";
            break;
        case 40: // down arrow
            direction = "down";
            break;
        default:
            return;
    }

    updateGameState(direction);
});

gameLoop = setInterval(() => {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (!snake || !fruit) {
        return;
    }

    drawSnake();
    drawFruit();
    drawScore();

    // determine which fruits each player can eat
    const playerFruit = playerNumber === 1 ? fruit.odd : fruit.even;

    // check if the snake has collided with the fruit
    if (snake[0].x === playerFruit.x && snake[0].y === playerFruit.y) {
        socket.emit("eatFruit", playerNumber);
    }
}, 100);
