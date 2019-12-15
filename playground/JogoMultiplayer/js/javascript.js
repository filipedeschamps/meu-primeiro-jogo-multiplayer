

const screen = document.getElementById('screen')
const context = screen.getContext('2d')


// dados jogo

const game = {
    players: {
        'player1': {x: 1 , y:1 },
        'player2': {x: 9, y: 9}
    },
    fruits: {
        'fruit1':{x: 3, y:1}
    }
}

renderScreen()

function renderScreen(){
    for (playerId in players){
        const player = game.players[playerId]
        context.fillStyle = 'black'
        context.fillRect(player.x,player.y, 1, 1)

    }
    for (fuitId in fruits){
        const fruit = game.fruits[fruitId]
        context.fillStyle = 'green'
        context.fillStyle(fruit.x,fruit.y,1,1)
        
    }

}


