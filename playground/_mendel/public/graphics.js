// camada de apresentação
// Implementação do padrão de design: Dependency Injection
export default function createGraphics(subject, screen, game, playerId, requestAnimationFrame) {
    // Parâmetro subject: contem a função para observar a camada de rede
    if (subject) {
        console.log('[presentation] Succesfully subscribed to network layer')
        subject.subscribe('presentation', receiveNotification)
    }

    const context = screen.getContext('2d')
    
    // Implementação do padrão d eprojeto Observer
    function receiveNotification(message) {
        // Define quais tipos de mensagem terão reação
        const respondsTo = {
            setup_game(command) {
                screen.width = command.new_state.screen.width
                screen.height = command.new_state.screen.height
            }
        }
        
        const commandFunction = respondsTo[message.type]
        console.log('[presentation] Received new state')
        if(commandFunction != undefined) {
            commandFunction(message)
        }
    }

    function renderScreen() {
        // clear screen
        context.fillStyle = 'white'
        context.clearRect(0, 0, screen.width, screen.height)
        
        // render players and fruits
        for (const playerId in game.state.players) {
            const player = game.state.players[playerId]
            context.fillStyle = 'black'
            context.fillRect(player.x, player.y, 1, 1)
        }
        for (const fruitId in game.state.fruits) {
            const fruit = game.state.fruits[fruitId]
            context.fillStyle = 'green'
            context.fillRect(fruit.x, fruit.y, 1, 1)
        }

        // printing player in yellow
        const currentPlayer = game.state.players[playerId]
        if(currentPlayer) {
            context.fillStyle = '#F0DB4F'
            context.fillRect(currentPlayer.x, currentPlayer.y, 1, 1)
        }

        // mantem a tela se atualizando, sincronizada com o navegador e de maneira otimizada
        requestAnimationFrame( () => {
            renderScreen()
        })
    }

    return {
        renderScreen
    }
}