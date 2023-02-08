export function setupScreen(canvas, game) {
    const { screen: {width, height, pixelsPerFields} } = game.state
    canvas.width = width * pixelsPerFields
    canvas.height = height * pixelsPerFields
}

export default function renderScreen(screen, scoreTable, game, requestAnimationFrame, currentPlayerId) {
    const context = screen.getContext('2d')
    context.fillStyle = 'white'
    
    const { screen: { width, height, size, coordenates, pixelsPerFields, dark, light }} = game.state
    context.clearRect(0, 0, width * pixelsPerFields, height * pixelsPerFields)
    let i, x, y = -1
    let totalSquares = Math.pow(size, 2)
    for (i = totalSquares; i > 0; i--) {
        x++
        if (i % size == 0) {
          y++
          x = 0
        }
        // Draw board
        context.beginPath()
        context.rect(x * pixelsPerFields, y * pixelsPerFields, pixelsPerFields, pixelsPerFields)
        context.fillStyle = (x + y) % 2 ? dark : light
        context.fill()

        // Draw coordenates
        if (i % size === 0){
            context.fillStyle = (x + y) % 2 ? light : dark
            context.fillText((i/size), (x+0.05) * pixelsPerFields, (y+0.2) * pixelsPerFields)
        }
        if (y+1 === size){
            context.fillStyle = (x + y) % 2 ? light : dark
            context.fillText(coordenates[x], (x+0.85) * pixelsPerFields, (y+0.9) * pixelsPerFields)
        }
        
      }

    for (const playerId in game.state.players) {
        const player = game.state.players[playerId]
        drawPlayer(context, player, game)
    }

    for (const fruitId in game.state.fruits) {
        const fruit = game.state.fruits[fruitId]
        drawFruit(context, fruit, game)        
    }

    const currentPlayer = game.state.players[currentPlayerId]
    if(currentPlayer) {
        const isCurrentPlayer = true
        drawPlayer(context, currentPlayer, game, isCurrentPlayer)
    }

    updateScoreTable(scoreTable, game, currentPlayerId)

    requestAnimationFrame(() => {
        renderScreen(screen, scoreTable, game, requestAnimationFrame, currentPlayerId)
    })
}

function drawPlayer(screenContext, player, game, isCurrentPlayer = false) {
    const { screen: { pixelsPerFields }} = game.state

    const whiteKing = 'images/wking.png'
    const blackKing = 'images/bking.png'

    const King = new Image()
    King.src = blackKing

    if (isCurrentPlayer) {
        King.src = whiteKing
    }

    let { x, y } = player
    x *= pixelsPerFields
    y *= pixelsPerFields

    // Draw king
    screenContext.drawImage(King, x, y, pixelsPerFields, pixelsPerFields)
}

function drawFruit(screenContext, fruit, game) {
    const { screen: { pixelsPerFields }} = game.state
    screenContext.globalAlpha = 1
    
    let { x, y } = fruit
    x *= pixelsPerFields
    y *= pixelsPerFields
    
    // Draw pawn   
    const blackPawn = 'images/bpawn.png'
    const bPawn = new Image()
    bPawn.src = blackPawn
    screenContext.drawImage(bPawn, x, y, pixelsPerFields, pixelsPerFields)
}

function updateScoreTable(scoreTable, game, currentPlayerId) {
    const maxResults = 10

    let scoreTableInnerHTML = `
        <tr class="header">
            <td>Top 10 Jogadores</td>
            <td>Pontos</td>
        </tr>
    `

    const playersArray = []

    for (let socketId in game.state.players) {
        const player = game.state.players[socketId]
        playersArray.push({
            playerId: socketId,
            playerName: player.playerName,
            x: player.x,
            y: player.y,
            score: player.score,
        })
    }
    
    const playersSortedByScore = playersArray.sort( (first, second) => {
        if (first.score < second.score) {
            return 1
        }

        if (first.score > second.score) {
            return -1
        }

        return 0
    })

    const topScorePlayers = playersSortedByScore.slice(0, maxResults)

    scoreTableInnerHTML = topScorePlayers.reduce((stringFormed, player) => {
        return stringFormed + `
            <tr class="${player.playerId === currentPlayerId ? 'current-player' : ''}">
                <td>${player.playerName === undefined ? player.playerId : player.playerName}</td>
                <td>${player.score}</td>
            </tr>
        `
    }, scoreTableInnerHTML)

    let playerInTop10 = false
    for (const player of topScorePlayers) {
        if (player.playerId === currentPlayerId) {
            playerInTop10 = true
            break
        }
    }

    if (!playerInTop10) {
        const currentPlayerFromTopScore = game.state.players[currentPlayerId]

        if (!currentPlayerFromTopScore) {
            return
        }

        scoreTableInnerHTML += `
            <tr class="current-player">
                <td>${currentPlayerFromTopScore.playerName === undefined ? currentPlayerId : currentPlayerFromTopScore.playerName}</td>
                <td>${currentPlayerFromTopScore.score}</td>
            </tr>
        `
    }

    scoreTable.innerHTML = scoreTableInnerHTML
}
