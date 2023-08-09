function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 10,
            height: 10
        }
    };

    const observers = [];

    function start(){
        const frc = 2000;

        setInterval(addFruit, frc);
    }

    function subscribe(observerFunction) {
        observers.push(observerFunction);
    }

    function notifyAll(command) {
        console.log(`Notifying ${observers.length} observers`);

        for (const observerFunction of observers) {
            observerFunction(command);
        }
    }
    
    function setState(newState){
        Object.assign(state, newState);
    }

    function addPlayer(command) {
        const playerId = command.playerId;
        const pX = "playerX" in command ? command.playerX : Math.floor(Math.random() * state.screen.width);
        const pY = "playerY" in command ? command.playerY : Math.floor(Math.random() * state.screen.height);

        state.players[playerId] = {
            x: pX,
            y: pY
        }

        notifyAll({
            type: "add-player",
            playerId: playerId,
            playerX: pX,
            playerY: pY
        })
    }

    function removePlayer(command) {
        const playerId = command.playerId;

        delete state.players[playerId];

        notifyAll({
            type: "remove-player",
            playerId: playerId
        });
    }

    function addFruit(command) {
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000000);
        const pX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width);
        const pY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height);

        state.fruits[fruitId] = {
            x: pX,
            y: pY
        }

        notifyAll({
            type: "add-fruit",
            fruitId: fruitId,
            fruitX: pX,
            fruitY: pY
        });
    }

    function removeFruit(command) {
        const fruitId = command.fruitId;

        delete state.fruits[fruitId];

        notifyAll({
            type: "remove-fruit",
            fruitId: fruitId
        });
    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId];

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId];

            if (player.x === fruit.x && player.y === fruit.y) {
                removeFruit({ fruitId });
            }
        }
    }

    function movePlayer(command) {
        notifyAll(command);

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
        setState,
        subscribe,
        start,
        state
    }
}

export default createGame;