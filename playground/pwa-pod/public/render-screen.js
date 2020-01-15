export function setupScreen(canvas, game) {
    const { screen: {width, height, pixelsPerFields} } = game.state
    canvas.width = width * pixelsPerFields
    canvas.height = height * pixelsPerFields
}

export default function renderScreen(screen, scoreTable, game, requestAnimationFrame, currentPlayerId) {
    const context = screen.getContext('2d')
    context.fillStyle = 'white'
    const { screen: { width, height, pixelsPerFields }} = game.state
    context.clearRect(0, 0, width*pixelsPerFields, height*pixelsPerFields)

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

    let eyeAndMouthColors = 'black'
    let faceColor = getColorFromScore(player.score)
    if (isCurrentPlayer) {
        eyeAndMouthColors = 'white'
    }

    let { x, y } = player
    x *= pixelsPerFields
    y *= pixelsPerFields

    // Draw face
    screenContext.fillStyle = faceColor
    screenContext.fillRect(x, y, pixelsPerFields, pixelsPerFields)

    // Draw eyes and mouth
    screenContext.fillStyle = eyeAndMouthColors
    screenContext.fillRect(x+1,y+1,1,1)
    screenContext.fillRect(x+3,y+1,1,1)
    screenContext.fillRect(x+1,y+3,3,1)
}

function drawFruit(screenContext, fruit, game) {
    const { screen: { pixelsPerFields }} = game.state
    screenContext.globalAlpha = 1
    
    let { x, y } = fruit
    x *= pixelsPerFields
    y *= pixelsPerFields
    
    // Draw strawberry body
    screenContext.fillStyle = '#ff0000'
    screenContext.fillRect(x, y+1, 1, 2)
    screenContext.fillRect(x+4, y+1, 1, 2)
    screenContext.fillRect(x+1, y+1, 1, 3)
    screenContext.fillRect(x+3, y+1, 1, 3)
    screenContext.fillRect(x+2, y+2, 1, 3)
 
    // Draw green leaf
    screenContext.fillStyle = '#00a933'
    screenContext.fillRect(x+1,y,3,1)
    screenContext.fillRect(x+2,y+1,1,1)
    
}

function getColorFromScore(score) {
    score *= 10
    const red = score > 240 ? 240 : score
    const green = score > 219 ? 219 : score
    const blue = score > 79 ? 79 : score
    return `rgb(${red},${green},${blue})`
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
                <td>${player.playerId}</td>
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
                <td>${currentPlayerId}</td>
                <td>${currentPlayerFromTopScore.score}</td>
            </tr>
        `
    }

    scoreTable.innerHTML = scoreTableInnerHTML
}
