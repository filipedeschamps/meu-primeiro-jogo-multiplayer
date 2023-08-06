function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 10,
            height: 10
        }
    };

    function addPlayer(command) {
        const playerId = command.playerId;
        const pX = command.playerX;
        const pY = command.playerY;

        state.players[playerId] = {
            x: pX,
            y: pY
        }
    }

    function removePlayer(command) {
        const playerId = command.playerId;

        delete state.players[playerId];
    }

    function addFruit(command) {
        const fruitId = command.fruitId;
        const pX = command.fruitX;
        const pY = command.fruitY;

        state.fruits[fruitId] = {
            x: pX,
            y: pY
        }
    }

    function removeFruit(command) {
        const fruitId = command.fruitId;

        delete state.fruits[fruitId];
    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId];

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId];

            if (player.x === fruit.x && player.y === fruit.y) {
                console.log("Vixi! BATEU");
                removeFruit({ fruitId });
            }
        }
    }

    function movePlayer(command) {
        const acceptedMoves = {
            ArrowUp: (player) => {
                if (player.y - 1 >= 0) {
                    player.y = player.y - 1;
                }
            },
            ArrowRight: (player) => {
                if (player.x + 1 < state.screen.width) {
                    player.x = player.x + 1;
                }
            },
            ArrowDown: (player) => {
                if (player.y + 1 < state.screen.height) {
                    player.y = player.y + 1;
                }
            },
            ArrowLeft: (player) => {
                if (player.x - 1 >= 0) {
                    player.x = player.x - 1;
                }
            },
        }

        const keyPressed = command.keyPressed;
        const playerId = command.playerId;
        const player = state.players[playerId];
        const moveFuntion = acceptedMoves[keyPressed];

        if (moveFuntion && player) {
            moveFuntion(player);
            checkForFruitCollision(playerId);
        }
    }

    return {
        movePlayer,
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit,
        state
    }
}

export default createGame;