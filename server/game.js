// Initialize the game
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set the canvas size
canvas.width = 600;
canvas.height = 600;

// Initialize the game variables
let snake = [];
let food = {};
let score = 0;
let direction = "right";
let gameover = false;
let playerNumber = null;

// Create the snake
function createSnake() {
    snake.push({ x: 10, y: 10 });
    snake.push({ x: 9, y: 10 });
    snake.push({ x: 8, y: 10 });
}

// Draw the snake
function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = "white";
        ctx.fillRect(snake[i].x * 20, snake[i].y * 20, 20, 20);
    }
}

// Move the snake
function moveSnake() {
    // Remove the last segment of the snake
    snake.pop();

    // Calculate the new head position
    let headX = snake[0].x;
    let headY = snake[0].y;

    switch (direction) {
        case "up":
            headY--;
            break;
        case "down":
            headY++;
            break;
        case "left":
            headX--;
            break;
        case "right":
            headX++;
            break;
    }

    // Add the new head to the snake
    let newHead = { x: headX, y: headY };
    snake.unshift(newHead);
}

// Create the food
function createFood() {
    // Generate a random position for the food
    let foodX = Math.floor(Math.random() * 30);
    let foodY = Math.floor(Math.random() * 30);

    // Make sure the food doesn't spawn on the snake
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === foodX && snake[i].y === foodY) {
            createFood();
            return;
        }
    }

    // Set the food position
    food = { x: foodX, y: foodY };
}

// Draw the food
function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * 20, food.y * 20, 20, 20);
}

// Check for collisions
function checkCollisions() {
    // Check for wall collision
    if (
        snake[0].x < 0 ||
        snake[0].x > 29 ||
        snake[0].y < 0 ||
        snake[0].y > 29
    ) {
        gameover = true;
    }

    // Check for snake collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            gameover = true;
        }
    }

    // Check for food collision
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // Add a new segment to the snake
        let tail = {
            x: snake[snake.length - 1].x,
            y: snake[snake.length - 1].y,
        };
        snake.push(tail);

        // Increment the score
        score++;

        // Create a new food
        createFood();
    }
}

// Update the game state
function update() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the snake and the food
    drawSnake();
    drawFood();

    // Move the snake
    moveSnake();

    // Check for collisions
    checkCollisions();

    // Update the score
    document.getElementById("score").innerHTML = score;

    // Check if the game is over
    if (!gameover) {
        // Request a new animation frame
        window.requestAnimationFrame(update);
    } else {
        // Display the game over message
        let message = document.getElementById("message");
        message.innerHTML = "Game Over!";
        message.style.display = "block";
    }
}

// Handle keyboard events
document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowUp":
            if (direction !== "down") {
                direction = "up";
            }
            break;
        case "ArrowDown":
            if (direction !== "up") {
                direction = "down";
            }
            break;
        case "ArrowLeft":
            if (direction !== "right") {
                direction = "left";
            }
            break;
        case "ArrowRight":
            if (direction !== "left") {
                direction = "right";
            }
            break;
    }
});

// Create the snake and the food
createSnake();
createFood();

// Start the game loop
window.requestAnimationFrame(update);
