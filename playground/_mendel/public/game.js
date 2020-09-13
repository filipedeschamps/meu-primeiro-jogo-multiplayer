// camada de jogo (dados + lógica)
// Implementação do design pattern: Factory
export default function createGame(subject) {            
    // Parâmetro subject: contem a função para observar a camada de rede
    if (subject) {
        console.log('[game] Succesfully subscribed to network layer')
        subject.subscribe('game', receiveNotification)
    }

    // armazena as informações do jogo
    const state = {
        players: {},
        fruits: {},
        fruit_limit: 150,
        screen: {
            width: 2,
            height: 2
        }
    }

    // Carrega o ID do timer que gera as frutas do mapa
    let spawnId = null

    // Casa o nome da teclas que devem ter funcionalidade com o nome de suas respectivas funções. Aí é só chamar as funções com o próprio nome da tecla!
    const acceptedMoves = {
        // Utilizando as funções max e min, podemos nos livrar completamente dos ifs. Maravilhoso!
        ArrowUp(player) {
            player.y = Math.max(player.y - 1, 0)
        },
        ArrowDown(player) {
            player.y = Math.min(player.y + 1, state.screen.height - 1)
        },
        ArrowLeft(player) {
            player.x = Math.max(player.x - 1, 0)
        },
        ArrowRight(player) {
            player.x = Math.min(player.x + 1, state.screen.width - 1)
        }
    }
    // Define os "aliases"
    Object.assign(acceptedMoves, {
        w (player) {
            acceptedMoves.ArrowUp(player)
        },
        a (player) {
            acceptedMoves.ArrowLeft(player)
        },
        s (player) {
            acceptedMoves.ArrowDown(player)
        },
        d (player) {
            acceptedMoves.ArrowRight(player)
        }
    })


    // Implementação do design pattern: Observer
    // Funções como observer
    function receiveNotification(message) {
        // Define quais tipos de mensagem terão reação
        const respondsTo = {
            setup_game(command) {
                Object.assign(state, command.new_state)
            }
        }
        // 
        const commandFunction = respondsTo[message.type]
        console.log('[game] Received new state')
        if(commandFunction != undefined) {
            commandFunction(message)
        }
    }
    // Funções como subject
    const observers = []

    function subscribe(observerFunction) {
        observers.push(observerFunction)
    }

    function notifyAll(command) {
        // console.log(`> Notifying ${observers.length} observers`)
        
        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }

    function addPlayer(command) {
        const playerId = command.playerId
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)
        // console.log(`> Adding ${playerId} at x:${playerX} y:${playerY}`)
        
        state.players[playerId] = {
            playerId,
            x: playerX,
            y: playerY
        }

        // utilizamos um observer em vez de disparar logo aqui o evento para atuar em conformidade com o padrão de Separation of Concerns
        notifyAll({
            type: 'add-player',
            playerId,
            playerX,
            playerY
        })
    }
    
    function removePlayer(command) {
        const playerId = command.playerId
        delete state.players[playerId]

        notifyAll({
            type: 'remove-player',
            playerId,
        })
    }
    
    function addFruit(command) {
        // Verifica se já não estourou o limite de frutas
        if (Object.keys(state.fruits).length >= state.fruit_limit) {
            return
        }
        
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000)
        let fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
        let fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)

        // Verifica se já existe uma fruta nesse local
        let position_conflict = true
        let tries = 0
        while (position_conflict && tries < 5) {
            position_conflict = false
            for (const id in {...state.fruits, ...state.players}) {
                const entity = state.fruits[id] ?? state.players[id]
                if (fruitX == entity.x && fruitY == entity.y) {
                    // console.log('[game] Tried spawning fruit in an occupied spot')
                    tries++
                    position_conflict = true
                    fruitX = Math.floor(Math.random() * state.screen.width)
                    fruitY = Math.floor(Math.random() * state.screen.height)
                    break
                }
            }
        }
        if (tries == 5) {
            return
        }

        console.log(`Adding ${fruitId} at x:${fruitX} y:${fruitY}`)

        state.fruits[fruitId] = {
            fruitId,
            x: fruitX,
            y: fruitY
        }

        notifyAll({
            type: 'add-fruit',
            fruitId,
            fruitX,
            fruitY
        })
    }

    function removeFruit(command) {
        const fruitId = command.fruitId
        delete state.fruits[fruitId]

        notifyAll({
            type: 'remove-fruit',
            fruitId
        })
    }

    function spawnFruits(frequency = 2000) {
        spawnId = setInterval(addFruit, frequency)
    }

    function movePlayer(command) {
        console.log(`> Moving ${command.playerId} with ${command.keyPressed}`)
        notifyAll(command)
        // Implementação do design pattern: Command

        const moveFunction = acceptedMoves[command.keyPressed]
        const player = state.players[command.playerId]
        // importante se proteger bem em ambientes assíncronos!
        if (player && moveFunction != undefined) {
            moveFunction(player)
            checkForFruitCollision(command.playerId)
        }
    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId]

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId]
            // console.log(`> Verifying collision between ${playerId} and ${fruitId}...`)
            if (player.x === fruit.x && player.y === fruit.y) {
                console.log(`> Collision detected!`)
                removeFruit( {fruitId} )
            }
        }
    }

    return {
        acceptedMoves,
        addPlayer,
        subscribe,
        removePlayer,
        addFruit,
        removeFruit,
        start: spawnFruits,
        movePlayer,
        state
    }
}