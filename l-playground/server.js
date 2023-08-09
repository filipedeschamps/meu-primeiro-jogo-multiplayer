import express from "express";
import http from "http";
import createGame from "./public/game.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const game = createGame();
const io = new Server(server);

game.start();

game.subscribe((command)=>{
    io.emit(command.type, command);
});

app.use(express.static("public"));

io.on("connection", (socket) => {
    const playerId = socket.id;

    game.addPlayer({ playerId: playerId });

    socket.on("disconnect", () => {
        game.removePlayer({ playerId: playerId });
    });

    socket.on("move-player", (command)=>{
        command.playerId = playerId;
        command.type = "move-player";
        game.movePlayer(command);
    });

    socket.emit("setup", game.state);
});

server.listen(3000, () => {
    console.log("Servidor ON!!")
});