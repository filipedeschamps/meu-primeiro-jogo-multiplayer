// eslint-disable-next-line no-undef
const socket = io(document.URL);
socket.on('connect', () => {
    console.log('> Connected to server');
});
socket.on('disconnect', () => {
    console.log('> Disconnected');
    if (confirm("Você foi desconectado.\nPressione OK para tentar reconectar.")) {
        location.reload();
    }
});

const screen = document.getElementById('screen');
const context = screen.getContext('2d');
let game;
let currentPlayer;

socket.on('bootstrap', (gameInitialState) => {
    game = gameInitialState;
    currentPlayer = game.players[game.players.findIndex(player => player.id === socket.id)]

    requestAnimationFrame(renderGame);

    function renderGame() {
        context.globalAlpha = 1;
        context.clearRect(0, 0, screen.width, screen.height);

        for (const i in game.players) {
            const player = game.players[i];
            for (let j = 0; j < player.body.length; j++) {
                context.fillStyle = '#ffffff';
                context.globalAlpha = 0.20;
                context.fillRect(player.body[j].x, player.body[j].y, 1, 1);
                if (player.id === socket.id) {
                    context.fillStyle = '#80e040';
                    context.globalAlpha = 0.40;
                    context.fillRect(player.body[j].x, player.body[j].y, 1, 1);
                }
            }
            context.fillStyle = '#ffffff';
            context.globalAlpha = 0.40;
            context.fillRect(player.body[0].x, player.body[0].y, 1, 1);
            if (player.id === socket.id) {
                context.fillStyle = '#80e040';
                context.globalAlpha = 1;
                context.fillRect(player.body[0].x, player.body[0].y, 1, 1);
            }
        }
        for (const i in game.fruits) {
            const fruit = game.fruits[i];
            context.fillStyle = '#d01050';
            context.globalAlpha = 1;
            context.fillRect(fruit.x, fruit.y, 1, 1);
        }
        updateScoreTable();
        requestAnimationFrame(renderGame);
    }

    function updateScoreTable() {
        const scoreTable = document.getElementById('score');
        const maxResults = 10;
        let scoreTableInnerHTML = `
            <tr class="header">
                <td>Top 10 Jogadores</td>
                <td>Pontos</td>
            </tr>
            `;
        const scoreArray = [];
        for (const i in game.players) {
            const player = game.players[i];
            scoreArray.push({
                player: player.id,
                score: player.points
            });
        }

        const scoreArraySorted = scoreArray.sort((first, second) => {
            if (first.score < second.score) {
                return 1;
            }
            if (first.score > second.score) {
                return -1;
            }
            return 0;
        });

        const scoreSliced = scoreArraySorted.slice(0, maxResults);
        scoreSliced.forEach((score) => {
            scoreTableInnerHTML += `
                <tr class="${ socket.id === score.player ? 'current-player' : ''}">
                    <td class="socket-id">${score.player}</td>
                    <td class="score-value">${score.score}</td>
                </tr>
                `;
        });

        let playerNotInTop10 = true;

        for (const score of scoreSliced) {
            if (socket.id === score.player) {
                playerNotInTop10 = false;
                break;
            }
            playerNotInTop10 = true;
        }

        if (playerNotInTop10) {
            scoreTableInnerHTML += `
                <tr class="current-player bottom">
                    <td class="socket-id">${socket.id}</td>
                    <td class="score-value">${currentPlayer.score}</td>
                </tr>
                `;
        }
        scoreTableInnerHTML += `
            <tr class="footer">
                <td>Total de jogadores</td>
                <td align="right">${game.players.length}</td>
            </tr>
            `;
        scoreTable.innerHTML = scoreTableInnerHTML;
    }

    document.addEventListener('keydown', (event) => {
        const keyPressed = event.key;
        socket.emit('playerMove', keyPressed);
    });

    socket.on('newGameState', gameState => {
        game = gameState;
        currentPlayer = game.players[game.players.findIndex(player => player.id === socket.id)];
    });
});