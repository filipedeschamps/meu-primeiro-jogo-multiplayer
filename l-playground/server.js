import express from "express";
import http from "http";
import createGame from "./public/game.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const game = createGame();
const io = new Server(server);

game.addPlayer({ playerId: "player1", playerX: 0, playerY: 0 });
game.addPlayer({ playerId: "player2", playerX: 0, playerY: 1 });
game.addPlayer({ playerId: "player3", playerX: 1, playerY: 0 });
game.addPlayer({ playerId: "player4", playerX: 1, playerY: 1 });
game.addFruit({ fruitId: "fruit1", fruitX: 2, fruitY: 2 });
game.addFruit({ fruitId: "fruit2", fruitX: 2, fruitY: 3 });

app.use(express.static("public"));

io.on("connection", (socket) => {
    const playerId = socket.id;

    console.log("Player connected:", playerId);

    // Handle player movements, fruit collection, and other events here

    socket.on("disconnect", () => {
        console.log("Player disconnected:", playerId);
        // Handle player disconnection and clean up here
    });

    socket.emit("setup", game.state);
});

server.listen(3000, () => {
    console.log("oI")
});