// camada de apresentação
// Implementação do padrão de design: Dependency Injection
export default function createGraphics(forum, document, game, playerId, requestAnimationFrame) {
    const screen = document.getElementById('screen')
    const scoreboard = document.getElementById('scoreboard')
    // Inscrição no forum
    const respondsTo = {
        setup_game(command) {
            console.log(`[graphics]> Received new state. ${command.new_state.screen.width} x ${command.new_state.screen.height}`)
            screen.width = command.new_state.screen.width
            screen.height = command.new_state.screen.height
            // Adiciona a lista de pontuação
            for (const playerId in command.new_state.players) {
                const player = command.new_state.players[playerId]
                scoreboardData.push({
                    id: playerId,
                    score: player.score
                })
            }
            updateScoreboard()
        },
        add_player(command) {
            // console.log('[graphics]> Recording new player')
            // console.log(command)
            scoreboardData.push({
                id: command.playerId,
                score: 0
            })
            updateScoreboard()
        },
        remove_player(command) {
            scoreboardData = scoreboardData.filter( (player) => {
                return player.id != command.playerId
            })
            updateScoreboard()
        },
        player_scored(command) {
            scoreboardData.forEach( (player) => {
                if (player.id == command.playerId) {
                    player.score = command.new_score
                }
            })
            updateScoreboard()
        }
    }
    const notifyForum = forum.subscribe('graphics', respondsTo)
    // console.log('[graphics]> Succesfully subscribed to forum')

    const context = screen.getContext('2d')
    let scoreboardData = []
    
    function renderScreen() {
        // clear screen
        context.fillStyle = 'white'
        context.clearRect(0, 0, screen.width, screen.height)
        
        // render players and fruits
        for (const playerId in game.state.players) {
            const player = game.state.players[playerId]
            context.fillStyle = 'rgb(0,0,0,0.2)'
            context.fillRect(player.x, player.y, 1, 1)
        }
        for (const fruitId in game.state.fruits) {
            const fruit = game.state.fruits[fruitId]
            context.fillStyle = 'limegreen'
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

    function updateScoreboard() {
        // Ordena a lista de jogadores por pontuação
        const playerScores = scoreboardData.sort( (player1, player2) => {
            return player2.score - player1.score
        })

        let new_html = ''
        playerScores.forEach( (player, rank) => {
            if (player.id === playerId) {
                new_html += `<tr class="active"><td>${rank+1}</td><td>${player.id}</td><td>${player.score}</td></tr>`
            } else {
                new_html += `<tr><td>${rank+1}</td><td>${player.id}</td><td>${player.score}</td></tr>`
            }
        })

        scoreboard.innerHTML = new_html
    }

    return {
        renderScreen
    }
}