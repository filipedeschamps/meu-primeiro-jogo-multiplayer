// camada de apresentação
// Implementação do padrão de design: Dependency Injection
export default function renderScreen(game, screen, requestAnimationFrame) {
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

    // mantem a tela se atualizando, sincronizada com o navegador e de maneira otimizada
    requestAnimationFrame( () => {
        renderScreen(game, screen, requestAnimationFrame)
    })
}