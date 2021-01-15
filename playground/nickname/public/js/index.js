
import createGame from "../game.js";
import createKeyboardListener from "./keyboard-listener.js";
import renderScreen, { setupScreen } from "./render-screen.js";

const game = createGame();
const keyboardListener = createKeyboardListener(document);

const socket = io();

socket.on("connect", () => {
  const playerId = socket.id;
  // console.log(`Player connected on Client with id: ${playerId}`)
  // console.log('socket', socket)

  const screen = document.getElementById("screen");
  const scoreTable = document.getElementById("score-table");

  setupScreen(screen, game);
  renderScreen(screen, scoreTable, game, requestAnimationFrame, playerId);
});

socket.on("disconnect", () => {
  console.log("Unsubscribing All");
  keyboardListener.unsubscribeAll();
});

socket.on("setup", (state) => {
  const playerId = socket.id;
  game.setState(state);
  const nickname = prompt('Choose your nickname', playerId.slice(0, 8))
  socket.emit("setup-nickname", { nickname: nickname || playerId.slice(0, 8) });

  keyboardListener.registerPlayerId(playerId);
  keyboardListener.subscribe(game.movePlayer);
  keyboardListener.subscribe((command) => {
    socket.emit("move-player", command);
  });
});
socket.on('change-nickname', (state) => {
  game.setState(state);
})


socket.on("add-player", (command) => {
  // console.log(`Receiving ${command.type} -> ${command.playerId}`)
  game.addPlayer(command);
});

socket.on("remove-player", (command) => {
  // console.log(`Receiving ${command.type} -> ${command.playerId}`)
  game.removePlayer(command);
});

socket.on("move-player", (command) => {
  // console.log(`Receiving ${command.type} -> ${command.playerId}`)

  const playerId = socket.id;

  if (playerId !== command.playerId) {
    game.movePlayer(command);
  }
});

socket.on("add-fruit", (command) => {
  // console.log(`Receiving ${command.type} -> ${command.fruitId}`)
  game.addFruit(command);
});

socket.on("remove-fruit", (command) => {
  // console.log(`Receiving ${command.type} -> ${command.fruitId}`)
  game.removeFruit(command);
});
