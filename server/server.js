const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Serve the static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Start the server
server.listen(3000, () => {
    console.log("Server running on port 3000");
});

// Define the game state
let gamestate = {
    players: {},
    fruits: {},
};

// Define the game loop
setInterval(() => {
    // Update the game state
    updateGameState();

    // Send the updated game state to all clients
    io.emit("gamestate", gamestate);
}, 1000 / 60);

// Handle a new connection
io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    // Add the new player to the game state
    gamestate.players[socket.id] = {
        x: Math.floor(Math.random() * 600) + 50,
        y: Math.floor(Math.random() * 400) + 50,
        score: 0,
    };

    // Send the initial game state to the new player
    socket.emit("gamestate", gamestate);

    // Handle a player input event
    socket.on("input", (input) => {
        // Update the player's position and score based on the input
        updatePlayer(socket.id, input);

        // Check for collisions between the player and the fruits
        checkCollisions(socket.id);

        // Send the updated game state to all clients
        io.emit("gamestate", gamestate);
    });

    // Handle a disconnect event
    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);

        // Remove the player from the game state
        delete gamestate.players[socket.id];
    });
});

// Update the game state
function updateGameState() {
    // Create a new fruit if there are less than 10 fruits
    if (Object.keys(gamestate.fruits).length < 10) {
        createFruit();
    }

    // Move each fruit to a random location
    Object.keys(gamestate.fruits).forEach((fruitId) => {
        let fruit = gamestate.fruits[fruitId];
        fruit.x = Math.floor(Math.random() * 600) + 50;
        fruit.y = Math.floor(Math.random() * 400) + 50;
    });
}

// Create a new fruit
function createFruit() {
    let id = Math.floor(Math.random() * 100000);
    let x = Math.floor(Math.random() * 600) + 50;
    let y = Math.floor(Math.random() * 400) + 50;
    let value = Math.floor(Math.random() * 10) + 1;
    gamestate.fruits[id] = { x, y, value };
}

// Update a player's position and score based on their input
function updatePlayer(playerId, input) {
    let player = gamestate.players[playerId];
    switch (input) {
        case "up":
            player.y -= 5;
            break;
        case "down":
            player.y += 5;
            break;
        case "left":
            player.x -= 5;
            break;
        case "right":
            player.x += 5;
            break;
    }

    // Check if the player has collided with a wall
    if (player.y < 0 || player.y > 500) {
        player.score -= 10;
        player.x = Math.floor(Math.random() * 600) + 50;
        player.y = Math.floor(Math.random() * 400) + 50;
    }
}

// Check for collisions between a player and the fruits
function checkCollisions(playerId) {
    let player = gamestate.players[playerId];
    Object.keys(gamestate.fruits).forEach((fruitId) => {
        let fruit = gamestate.fruits[fruitId];
        if (collides(player, fruit)) {
            // Remove the fruit from the game state
            delete gamestate.fruits[fruitId];
            // Update the player's score
            if (fruit.value % 2 == 0) {
                player.score += fruit.value;
            } else {
                player.score -= fruit.value;
            }
        }
    });
}

// Check if two objects are colliding
function collides(a, b) {
    if (a.x < b.x + 10 || a.x > b.x - 10 || a.y < b.y + 10 || a.y > b.y - 10) {
        return false;
    } else {
        return true;
    }
}
