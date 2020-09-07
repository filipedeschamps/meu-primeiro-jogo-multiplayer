// camada de apresentação
// Implementação do padrão de design: Dependency Injection
export default function renderScreen(game, screen, playerId, requestAnimationFrame) {
    const context = screen.getContext('2d')
    // clear screen
    context.fillStyle = 'white'
    context.clearRect(0, 0, 10, 10)
    
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
        renderScreen(game, screen, playerId, requestAnimationFrame)
    })
}