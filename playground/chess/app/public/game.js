export default function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 8,
            height: 8,
            size: 8,
            coordenates: ['a','b','c','d','e','f','g','h'],
            pixelsPerFields: 50,
            light: '#f0d9b5',
            dark: '#b58863'
        }
    }

    const observers = []

    function start() {
        const frequency = 3000

        setInterval(addFruit, frequency)
    }

    function subscribe(observerFunction) {
        observers.push(observerFunction)
    }

    function notifyAll(command) {
        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }

    function setState(newState) {
        Object.assign(state, newState)
    }

    function addPlayer(command) {
        let playerId, playerName, playerX, playerY

        do {
            playerId = command.playerId
            playerName = command.playerName
            playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
            playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)
        } while (checkForOccupiedSquare(state.fruits, playerX, playerY))
        
        const score = 0

        state.players[playerId] = {
            playerName: playerName,
            x: playerX,
            y: playerY,
            score
        }

        notifyAll({
            type: 'add-player',
            playerId: playerId,
            playerName: playerName,
            playerX: playerX,
            playerY: playerY,
            score
        })
    }

    function removePlayer(command) {
        const playerId = command.playerId

        delete state.players[playerId]

        notifyAll({
            type: 'remove-player',
            playerId: playerId
        })
    }

    function addFruit(command) {
        let fruitId, fruitX, fruitY
        do {
            fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000)
            fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
            fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)
        } while (checkForOccupiedSquare(state.players, fruitX, fruitY))

        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }
        
        notifyAll({
            type: 'play-audio',
            audio: 'newFruit',
            playersId: getIdPlayers()
        })

        notifyAll({
            type: 'add-fruit',
            fruitId: fruitId,
            fruitX: fruitX,
            fruitY: fruitY
        })
    }

    //retorna array com os Id's dos players
    function getIdPlayers(){
        let { players } = state
        let playersId = []
        
        for (const playerId in players) {
            playersId.push(playerId)              
        }
        return playersId        
    }

    function removeFruit(command) {
        const {fruitId, playerId} = command

        delete state.fruits[fruitId]

        notifyAll({
            type: 'play-audio',
            audio: 'eatFruit',
            playersId: [playerId]
        })

        notifyAll({
            type: 'remove-fruit',
            fruitId: fruitId,
        })
    }

    function illegalMove(playerId) {
        notifyAll({
            type: 'play-audio',
            audio: 'illegalMove',
            playersId: [playerId]
        })   
    }

    function movePlayer(command) {
        notifyAll(command)
        
        const acceptedMoves = {
            ArrowUp(player) {
                const moveX = player.x
                const moveY = player.y - 1
                if (moveY >= 0) {
                    if (checkForProtectedSquare(moveX, moveY) && checkForKingSquare(command.playerId, moveX, moveY)){
                        player.y = moveY
                    } else illegalMove(command.playerId)
                }
            },
            ArrowRight(player) {
                const moveX = player.x + 1
                const moveY = player.y
                if ( moveX < state.screen.width) {
                    if (checkForProtectedSquare(moveX, moveY) && checkForKingSquare(command.playerId, moveX, moveY)){
                        player.x = moveX
                    } else illegalMove(command.playerId)
                }
            },
            ArrowDown(player) {
                const moveX = player.x
                const moveY = player.y + 1
                if (moveY < state.screen.height) {
                    if (checkForProtectedSquare(moveX, moveY) && checkForKingSquare(command.playerId, moveX, moveY)){
                        player.y = moveY
                    } else illegalMove(command.playerId)
                }
            },
            ArrowLeft(player) {
                const moveX = player.x - 1
                const moveY = player.y
                if (moveX >= 0) {
                    if (checkForProtectedSquare(moveX, moveY) && checkForKingSquare(command.playerId, moveX, moveY)) {
                        player.x = moveX
                    } else illegalMove(command.playerId)
                }
            },
            a(player) {
                const moveX = player.x - 1
                const moveY = player.y - 1
                if (moveX >= 0 && moveY >= 0) {
                    if (checkForProtectedSquare(moveX, moveY) && checkForKingSquare(command.playerId, moveX, moveY)) {
                        player.x = moveX
                        player.y = moveY
                    } else illegalMove(command.playerId)
                }
            },
            s(player) {
                const moveX = player.x + 1
                const moveY = player.y - 1
                if (moveX < state.screen.width && moveY >= 0) {
                    if (checkForProtectedSquare(moveX, moveY)  && checkForKingSquare(command.playerId, moveX, moveY)) {
                        player.x = moveX
                        player.y = moveY
                    } else illegalMove(command.playerId)
                }
            },
            z(player) {
                const moveX = player.x - 1
                const moveY = player.y + 1
                if (moveX >= 0 && moveY < state.screen.height ) {
                    if (checkForProtectedSquare(moveX, moveY)  && checkForKingSquare(command.playerId, moveX, moveY)) {
                        player.x = moveX
                        player.y = moveY
                    } else illegalMove(command.playerId)
                }
            },
            x(player) {
                const moveX = player.x + 1
                const moveY = player.y + 1
                if (moveX < state.screen.width && moveY < state.screen.height) {
                    if (checkForProtectedSquare(moveX, moveY)  && checkForKingSquare(command.playerId, moveX, moveY)) {
                        player.x = moveX
                        player.y = moveY
                    } else illegalMove(command.playerId)
                }
            }
        }

        const keyPressed = command.keyPressed
        const playerId = command.playerId
        const player = state.players[playerId]
        const moveFunction = acceptedMoves[keyPressed]

        if (player && moveFunction) {
            moveFunction(player)
            checkForFruitCollision(playerId)
        }

    }

    // Check if the square is occupied by a pawn or king
    function checkForOccupiedSquare(Object, squareX, squareY) {
        for (const objectId in Object) {
            const object = Object[objectId]
            if (object.x === squareX && object.y === squareY) {
                return true
            }
        }
        return false
    }

    // Check if the square is protected by another pawn
    function checkForProtectedSquare(moveX, moveY) {
        for (const squareId in state.fruits) {
            const square = state.fruits[squareId]

            if ((square.x - 1 === moveX && square.y + 1 === moveY) || (square.x + 1 === moveX && square.y + 1 === moveY)) {
                return false
            }
        }
        return true
    }

    // Check if the square is protected by black king
    function checkForKingSquare(playerId, moveX, moveY) {
        let validMove = true
        Object.keys(state.players).filter(k => k !== playerId).forEach(otherPlayerKey => {
            let otherPlayers = state.players[otherPlayerKey]
            var a = moveX - otherPlayers.x
            var b = moveY - otherPlayers.y
            const distance = Math.sqrt( a*a + b*b )
            
            if(distance < 2) {
                validMove = false
            }
        })
        return validMove
    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId]

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId]
            // console.log(`Checking ${playerId} score ${player.score} and ${fruitId}`)

            if (player.x === fruit.x && player.y === fruit.y) {
                    if (!checkForProtectedSquare(fruit.x, fruit.y)) {
                        return
                    }
                    removeFruit({ fruitId, playerId })
                    player.score += 1
            }
        }
    }

    return {
        addPlayer,
        removePlayer,
        movePlayer,
        addFruit,
        removeFruit,
        state,
        setState,
        subscribe,
        start
    }
}
