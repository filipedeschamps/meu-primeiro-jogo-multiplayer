// camada de jogo (dados + lógica)
// Implementação do design pattern: Factory
export default function createGame(forum) {            
    // Interação com o forum
    const respondsTo = {
        setup_game(command) {
            console.log('[game]> Received new state')
            Object.assign(state, command.new_state)
        },
        move_player,
        add_player,
        remove_player,
        add_fruit,
        remove_fruit
    }
    const notifyForum = forum.subscribe('game', respondsTo)
    console.log('[game]> Succesfully subscribed to forum')


    // armazena as informações do jogo
    const state = {
        players: {},
        fruits: {},
        fruit_limit: 15,
        screen: {
            width: 15,
            height: 15
        }
    }

    const settings = {
        fruitValue: 10
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

    function add_player(command) {
        const playerId = command.playerId
        const receivedCoordinates = 'playerX' in command && 'playerY' in command
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)
        // console.log(`> Adding ${playerId} at x:${playerX} y:${playerY}`)

        state.players[playerId] = {
            playerId,
            x: playerX,
            y: playerY,
            score: 0
        }

        // somente notificamos se não houver recebido as coordenadas
        if (!receivedCoordinates) {
            notifyForum({
                type: 'add_player',
                playerId,
                playerX,
                playerY
            })
        }
    }
    
    function remove_player(command) {
        const playerId = command.playerId
        delete state.players[playerId]

        notifyForum({
            type: 'remove_player',
            playerId,
        })
    }
    
    function add_fruit(command) {
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

        // console.log(`[game]> Adding fruit ${fruitId} at x:${fruitX} y:${fruitY}`)

        state.fruits[fruitId] = {
            fruitId,
            x: fruitX,
            y: fruitY
        }

        notifyForum({
            type: 'add_fruit',
            fruitId,
            fruitX,
            fruitY
        })
    }

    function remove_fruit(command) {
        const fruitId = command.fruitId
        delete state.fruits[fruitId]

        notifyForum({
            type: 'remove_fruit',
            fruitId
        })
    }

    function spawnFruits(frequency = 2000) {
        // Limita o máximo de frutas para o tamanho da tela
        state.fruit_limit = Math.min(state.fruit_limit, state.screen.width * state.screen.height)
        spawnId = setInterval(add_fruit, frequency)
    }

    function move_player(command) {
        // console.log(`> Moving ${command.playerId} with ${command.keyPressed}`)
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
                // console.log(`> Collision detected!`)
                player.score += settings.fruitValue
                remove_fruit( {fruitId} )
                notifyForum({
                    type: 'player_scored',
                    playerId,
                    new_score: player.score
                })
            }
        }
    }

    return {
        acceptedMoves,
        add_player,
        remove_player,
        add_fruit,
        remove_fruit,
        spawnFruits,
        move_player,
        state
    }
}