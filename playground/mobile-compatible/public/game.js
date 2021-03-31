export default function createGame() {
    const state = {
        players: {},
        fruits: {},
        removers: {},
        screen: {
            width: 10,
            height: 10
        }
    }

    const observers = []

    function start() {
        const frequency = 2000

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
            x: playerX,
            y: playerY
        }

        notifyAll({
            type: 'add-player',
            playerId: playerId,
            playerX: playerX,
            playerY: playerY
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
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000)
        const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
        const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)

        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }

        notifyAll({
            type: 'add-fruit',
            fruitId: fruitId,
            fruitX: fruitX,
            fruitY: fruitY
        })
    }

    function removeFruit(command) {
        const fruitId = command.fruitId

        delete state.fruits[fruitId]

        notifyAll({
            type: 'remove-fruit',
            fruitId: fruitId,
        })
    }
    
    function addRemover(command) {
		const removerId = command.removerId
		const removerX = 'removerX' in command ? command.removerX : Math.floor(Math.random() * state.screen.width)
		const removerY = 'removerY' in command ? command.removerY : Math.floor(Math.random() * state.screen.height)
		
		state.removers[removerId] = {
			x: removerX,
			y: removerY
		}
		
		notifyAll({
			type: 'add-remover',
			removerId: removerId,
			removerX: removerX,
			removerY: removerY
		})

    }
    
    function removeRemover(command) {
    	const removerId = command.removerId
    	
    	delete state.removers[removerId]
    	
    	notifyAll({
    		type: 'remove-remover',
    		removerId: removerId
    	})
    }
    
    function getTargetFromRemover(removerId) {
    	const remover = state.removers[removerId]
    	const players = Object.values(state.players); //Array
    	
    	let target = players[0]
    	for (let i = 1; i < players.length; i++) {
    		const player = players[i]
			
    		const newDistanceX = remover.x > player.x ? remover.x - player.x : player.x - remover.x
    		const newDistanceY = remover.y > player.y ? remover.y - player.y : player.y - remover.y
    		const newTotalDistance = newDistanceX + newDistanceY
    		
    		const distanceX = remover.x > target.x ? remover.x - target.x : target.x - remover.x
    		const distanceY = remover.y > target.y ? remover.y - target.y : target.y - remover.y
    		const totalDistance = distanceX + distanceY
    		
    		//new Target
    		if (newTotalDistance < totalDistance) {
    			target = player
    		}
    	}
		
		const keys = Object.keys(state.players), values = Object.values(state.players)
		const targetId = keys[values.indexOf(target)]
		
		if (remover.targetId !== targetId) {
    		newTarget({
 				type: 'new-target',
 				removerId: removerId,
 				targetId: targetId
 			})
		}
		return targetId
    }
    
    function moveRemover(command) {
    	notifyAll(command)
    	
    	const moves = {
    		up(remover) {
    			remover.y = remover.y - 1
         },
         right(remover) {
         	remover.x = remover.x + 1
         },
         down(remover) {
         	remover.y = remover.y + 1
         },
         left(remover) {
         	remover.x = remover.x - 1
         }
    	}
    	
    	const direction = command.direction
    	const removerId = command.removerId
    	const remover = state.removers[removerId]
    	const moveFunction = moves[direction]
    	
    	if (remover && moveFunction) {
    		moveFunction(remover)
    		checkForRemoverCollision(removerId)
    	}
    	
    }
	
	 function newTarget(command) {
	 	notifyAll(command)
	 	
	 	const remover = state.removers[command.removerId]

	 	remover.targetId = command.targetId
	 	
	 }
	
    function checkForRemoverCollision(removerId) {
    	const remover = state.removers[removerId]
    	
    	for (const playerId in state.players) {
    		const player = state.players[playerId]
         console.log(`Checking ${removerId} and ${playerId}`)
         
         if (remover.x === player.x && remover.y === player.y) {
         	console.log(`COLLISION between ${removerId} and ${playerId}`)
         	removePlayer({ playerId: playerId })
         }
    		
    	}
    }
    
    function movePlayer(command) {
        notifyAll(command)

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

        const keyPressed = command.keyPressed
        const playerId = command.playerId
        const player = state.players[playerId]
        const moveFunction = acceptedMoves[keyPressed]

        if (player && moveFunction) {
            moveFunction(player)
            checkForFruitCollision(playerId)
        }

    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId]

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId]
            console.log(`Checking ${playerId} and ${fruitId}`)

            if (player.x === fruit.x && player.y === fruit.y) {
                console.log(`COLLISION between ${playerId} and ${fruitId}`)
                removeFruit({ fruitId: fruitId })
            }
        }
    }
    

    return {
        addPlayer,
        removePlayer,
        movePlayer,
        addFruit,
        removeFruit,
        addRemover,
        removeRemover,
        moveRemover,
        getTargetFromRemover,
        checkForRemoverCollision,
        newTarget,
        state,
        setState,
        subscribe,
        start
    }
}
