// camada de jogo (dados + lógica)
// Implementação do design pattern: Factory
export default function createGame() {            
    // armazena as informações do jogo
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 10,
            height: 10
        },
        currentPlayerId: null

    }

    function addPlayer(command) {
        const playerId = command.playerId
        const x = command.x
        const y = command.y
        console.log(`Adding ${playerId} at x:${x} y:${y}`)
        
        state.players[playerId] = {
            playerId,
            x,
            y
        }
    }
    
    function removePlayer(playerId) {
        delete state.players[playerId]
    }
    
    function addFruit(command) {
        const fruitId = command.fruitId
        const x = command.x
        const y = command.y
        console.log(`Adding ${fruitId} at x:${x} y:${y}`)

        state.fruits[fruitId] = {
            fruitId,
            x,
            y
        }
    }

    function removeFruit(fruitId) {
        delete state.fruits[fruitId]
    }

    function movePlayer(command) {
        console.log(`Moving ${command.playerId} with ${command.keyPressed}`)
        // Implementação do design pattern: Command
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
            console.log(`Verifying collision between ${playerId} and ${fruitId}...`)
            if (player.x === fruit.x && player.y === fruit.y) {
                console.log(`Collision detected!`)
                removeFruit(fruitId)
            }
        }
    }

    return {
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit,
        movePlayer,
        state
    }
}