import { mod } from "./utils.js"

export default function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 25,
            height: 25,
            pixelsPerFields: 16, //less than 15 is hard to read the points
        },
        config: {
            maxCollisionDistance: 4,
            playerCollisionCost: 100,
            wallCollisionCost: 150,
            initialScore: 500,
            autoDropFruitValue: 50,
            showPotsValue: false,
        }
    }

    const observers = []

    function start() {
        const frequency = 2000

        //todo: change fruit colors based on quantity on same coord
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
        const playerId = command.playerId
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)

        state.players[playerId] = {
            playerId: playerId,
            x: playerX,
            y: playerY,            
            score: state.config.initialScore
        }

        notifyAll({
            type: 'add-player',
            playerId: playerId,
            playerX: playerX,
            playerY: playerY,
            score: state.config.initialScore
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

    //retorna array com os players proximos a coordenada
    function getPlayersAround(coords){
        let { config:{maxCollisionDistance}, players } = state
        let playersAround = []
        
        for (const playerId in players) {
            const player = players[playerId]
            const {x,y} = player
            const distance = Math.sqrt((coords.x - x) * (coords.y-y));
            if(distance <= maxCollisionDistance)
                playersAround.push(playerId)              
        }
        return playersAround        
    }

    function addFruit(command) {
        const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
        const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)
        const fruitId = command ? command.fruitId : `${fruitX}-${fruitY}`
        const quantity = command ? command.quantity : state.config.autoDropFruitValue

        const oldQuantity = state.fruits[fruitId] ? state.fruits[fruitId].quantity : 0

        /** update quantity */
        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY,
            quantity: quantity + oldQuantity
        }
        
        //new fruit dispatch sound for who is around
        notifyAll({
            type: 'play-audio',
            audio: 'newFruit',
            playersId: getPlayersAround(state.fruits[fruitId])
        })  

        notifyAll({
            type: 'add-fruit',
            fruitId: `${fruitX}-${fruitY}`,
            fruitX,
            fruitY,
            quantity: quantity
        })
    }

    function removeFruit(command) {
        const {fruitId, playerId} = command
        
        delete state.fruits[fruitId]          
        
        //make sound for who ate the fruit
        notifyAll({
            type: 'play-audio',
            audio: 'drinkPot',
            playersId: [playerId]
        })        

        notifyAll({
            type: 'remove-fruit',
            fruitId
        })
    }    

    function onBorderShock(player) {
        const { config: { wallCollisionCost } } = state
        let shockCost = Math.min(player.score, wallCollisionCost)
        state.players[player.playerId].score -= shockCost
        explodeFruits(shockCost, player.x, player.y)

        //only play this sound for this user who sock against the wall
        notifyAll({
            type: 'play-audio',
            audio: 'wallCollision',
            playersId: [player.playerId]
        })   
    }

    function movePlayer(command) {
        notifyAll(command)

        const acceptedMoves = {
            ArrowUp(player) {
                if (player.y - 1 >= 0) {
                    player.y = player.y - 1
                } else onBorderShock(player)
            },
            ArrowRight(player) {
                if (player.x + 1 < state.screen.width) {
                    player.x = player.x + 1
                } else onBorderShock(player)
            },
            ArrowDown(player) {
                if (player.y + 1 < state.screen.height) {
                    player.y = player.y + 1
                } else onBorderShock(player)
            },
            ArrowLeft(player) {
                if (player.x - 1 >= 0) {
                    player.x = player.x - 1
                } else onBorderShock(player)
            }
        }

        const keyPressed = command.keyPressed
        const playerId = command.playerId
        const player = state.players[playerId]
        const moveFunction = acceptedMoves[keyPressed]

        //stop player movement when die
        if (player && moveFunction && player.score > 0) {
            moveFunction(player)
            checkForFruitCollision(playerId)
            checkForPlayerCollision(playerId)
        }

    }

    /** check if user got points and generate collision 
     *  we can detect the direction of collision if save last position, to step back 
    */
    function checkForPlayerCollision(playerId) {
        const player = state.players[playerId]

        Object.keys(state.players).filter(k => k !== playerId).forEach(otherPlayerKey => {
            let otherPlayers = state.players[otherPlayerKey]
            if (player.x === otherPlayers.x && player.y === otherPlayers.y && otherPlayers.score > 0) {
                //remove 5 points and show extra 5 fruits for each player
                //console.log(`COLLISION between ${playerId} and ${otherPlayerKey}`)

                let otherPlayerDiscount = Math.min(otherPlayers.score, state.config.playerCollisionCost)
                let playerDiscount = Math.min(player.score, state.config.playerCollisionCost)
                let totalFruits = otherPlayerDiscount + playerDiscount

                state.players[otherPlayerKey].score -= otherPlayerDiscount
                state.players[playerId].score -= playerDiscount
                
                //make sound for 2 users when crash
                notifyAll({
                    type: 'play-audio',
                    audio: 'playerCollision',
                    playersId: [playerId,otherPlayerKey]
                }) 

                explodeFruits(totalFruits, player.x, player.y)
            }
        })
    }

    /** generate random number inclusive */
    function randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * generate fruits based on collission and remaining user points
     */
    function explodeFruits(qtd, x, y) {
        let { screen:{width, height, pixelsPerFields}, config } = state
        //calculate possible new coordinates
        let maxX = Math.min(x + config.maxCollisionDistance, width-1)
        let minX = Math.max(x - config.maxCollisionDistance, 1)
        let maxY = Math.min(y + config.maxCollisionDistance, height-1)
        let minY = Math.max(y - config.maxCollisionDistance, 1)

        let rest = qtd
        while (rest > 0) {
            let fruitQtd = randomInteger(1, rest)
            rest -= fruitQtd
            let fruitX = randomInteger(minX, maxX)
            let fruitY = randomInteger(minY, maxY)
            let fruitId = `${fruitX}-${fruitY}`
            addFruit({
                fruitId,
                fruitX,
                fruitY,
                quantity: fruitQtd
            })
        }
        //console.log(`state`,state)
    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId]

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId]
            // console.log(`Checking ${playerId} score ${player.score} and ${fruitId}`)

            if (player.x === fruit.x && player.y === fruit.y) {
                // console.log(`COLLISION between ${playerId} and ${fruitId}`)

                //only make sound for this user
                removeFruit({ fruitId, playerId })
                player.score += fruit.quantity
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
