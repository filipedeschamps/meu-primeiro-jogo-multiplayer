export default function createGame() {
  const state = {
    players: {},
    fruits: {},
    screen: {
      width: 10,
      height: 10
    }
  }

  function addPlayer(command) {
    const { playerId, playerX, playerY } = command

    state.players[playerId] = {
      x: playerX,
      y: playerY
    }
  }

  function removePlayer(command) {
    delete state.players[command.playerId]
  }

  function addFruit(command) {
    const { fruitId, fruitX, fruitY } = command

    state.fruits[fruitId] = {
      x: fruitX,
      y: fruitY
    }
  }

  function removeFruit(command) {
    delete state.fruits[command.fruitId]
  }

  function movePlayer(command) {
    const { playerId, keyPressed } = command

    const acceptedMoves = {
      ArrowUp(player) {
        if (player.y - 1 >= 0) {
          player.y = player.y - 1
        }
      },
      ArrowRight(player) {
        if (player.x + 1 < state.screen.width) {
          player.x = player.x + 1
        }
      },
      ArrowDown(player) {
        if (player.y + 1 < state.screen.height) {
          player.y = player.y + 1
        }
      },
      ArrowLeft(player) {
        if (player.x - 1 >= 0) {
          player.x = player.x - 1
        }
      }
    }

    const player = state.players[playerId]
    const moveFunction = acceptedMoves[keyPressed]

    if (player && moveFunction) {
      moveFunction(player);
      checkForFruitCollision(playerId)
    }
  }

  function checkForFruitCollision(playerId) {
    const player = state.players[playerId]

    for (const fruitId in state.fruits) {
      const fruit = state.fruits[fruitId]

      if (player.x === fruit.x && player.y === fruit.y) {
        console.log(`collision between ${playerId} and ${fruitId}`);
        removeFruit({ fruitId })
      }
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
