export default function createGame(sendUpdate = () => { }) {
    const screen = { width: 10, height: 10 }
    const state = {
        players: {},
        fruits: {},
    }

    function updateGame(command) {
        switch (command.type) {
            case 'add-player': {
                if (!('x' in command)) {
                    command.x = Math.floor(Math.random() * screen.width)
                    command.y = Math.floor(Math.random() * screen.height)
                }

                state.players[command.playerId] = {
                    x: command.x,
                    y: command.y,
                }
                break
            }
            case 'add-fruit': {
                if (!('fruitId' in command)) {
                    command.x = Math.floor(Math.random() * screen.width)
                    command.y = Math.floor(Math.random() * screen.height)
                    command.fruitId = String(command.x) + String(command.y)
                }

                state.fruits[command.fruitId] = {
                    x: command.x,
                    y: command.y,
                }
                break
            }
            case 'remove-player': {
                delete state.players[command.playerId]
                break
            }
            case 'remove-fruit': {
                delete state.fruits[command.fruitId]
                break
            }
            case 'move-player': {
                const playerId = command.playerId
                const player = state.players[playerId]

                if (!player) break

                switch (command.keyPressed) {
                    case 'ArrowUp':
                    case 'w':
                        if (player.y - 1 >= 0) {
                            player.y -= 1
                        }
                        break

                    case 'ArrowDown':
                    case 's':
                        if (player.y + 1 < screen.height) {
                            player.y += 1
                        }
                        break

                    case 'ArrowRight':
                    case 'd':
                        if (player.x + 1 < screen.width) {
                            player.x += 1
                        }
                        break

                    case 'ArrowLeft':
                    case 'a':
                        if (player.x - 1 >= 0) {
                            player.x -= 1
                        }
                        break

                }

                const fruitId = String(player.x) + String(player.y)
                if (state.fruits[fruitId]) {
                    console.log(`COLLISION between ${playerId} and ${fruitId}`)
                    updateGame({ type: 'remove-fruit', fruitId: fruitId })
                }
                break
            }
        }
        sendUpdate(command)
    }

    return {
        state,
        screen,
        updateGame,
    }
}
