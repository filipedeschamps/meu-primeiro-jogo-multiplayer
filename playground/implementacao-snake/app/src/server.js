const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', (req, res) => {
    res.render('index.html');
})
app.use(cors);

const logOnline = () => console.log('> ONLINE NOW: ' + online);

//setInterval(logOnline, 30000)

let game = {
    players: [],
    fruits: []
};
let online = game.players.length;

setInterval(addFruit, 6000);

function addFruit() {
    if (game.fruits.length < 7) {
        game.fruits.push({
            x: Math.floor(Math.random() * (1 - 29)) + 29,
            y: Math.floor(Math.random() * (1 - 29)) + 29
        });
        for (const i in game.fruits) {
            const fruit = game.fruits[i];
            for (const j in game.players) {
                const player = game.players[j];
                if (fruit.y === player.y && fruit.x === player.x) {
                    game.fruits.splice(-1, 1);
                    addFruit();
                }
            }
            io.sockets.emit('newGameState', game);
        }
    }
}

io.on('connection', socket => {
    console.log("\x1b[33m", '> ' + socket.id + ' = CONNECT', "\x1b[0m");
    game.players.push({
        id: socket.id,
        body: [],
        points: 0,
        lastMovement: null
    });
    const currentPlayer = game.players.findIndex(player => player.id === socket.id);
    game.players[currentPlayer].body.push({
        x: Math.floor(Math.random() * (1 - 29)) + 29,
        y: Math.floor(Math.random() * (1 - 29)) + 29
    });

    online = game.players.length;
    logOnline();
    socket.emit('bootstrap', game);
    socket.broadcast.emit('newGameState', game);

    const autoMove = setInterval(checkLastMovement, 500);

    function checkLastMovement() {
        if (game.players[currentPlayer].lastMovement) {
            newMovement(game.players[currentPlayer].lastMovement);
        }
    }

    socket.on('playerMove', keyPressed => newMovement(keyPressed));

    function newMovement(moveData) {
        switch (moveData) {
            case "ArrowUp":
                game.players[currentPlayer].lastMovement = "ArrowUp";
                game.players[currentPlayer].body[0].y--;
                if (game.players[currentPlayer].body[0].y === -1)
                    game.players[currentPlayer].body[0].y += 30;
                break;
            case "ArrowDown":
                game.players[currentPlayer].lastMovement = "ArrowDown";
                game.players[currentPlayer].body[0].y++;
                if (game.players[currentPlayer].body[0].y === 30)
                    game.players[currentPlayer].body[0].y -= 30;
                break;
            case "ArrowLeft":
                game.players[currentPlayer].lastMovement = "ArrowLeft";
                game.players[currentPlayer].body[0].x--;
                if (game.players[currentPlayer].body[0].x === -1)
                    game.players[currentPlayer].body[0].x += 30;
                break;
            case "ArrowRight":
                game.players[currentPlayer].lastMovement = "ArrowRight";
                game.players[currentPlayer].body[0].x++;
                if (game.players[currentPlayer].body[0].x === 30)
                    game.players[currentPlayer].body[0].x -= 30;
                break;
            default:
                return;
        }

        for (let i = game.players[currentPlayer].body.length - 1; i > 0; i--) {
            game.players[currentPlayer].body[i].x = game.players[currentPlayer].body[i - 1].x;
            game.players[currentPlayer].body[i].y = game.players[currentPlayer].body[i - 1].y;
        }

        socket.emit('newGameState', game);
        socket.broadcast.emit('newGameState', game);

        for (const i in game.fruits) {
            const fruit = game.fruits[i];
            if (game.players[currentPlayer].body[0].x === fruit.x && game.players[currentPlayer].body[0].y === fruit.y) {
                game.fruits.splice(i, 1);
                game.players[currentPlayer].points++;

                game.players[currentPlayer].body.push({
                    x: game.players[currentPlayer].body[game.players[currentPlayer].body.length - 1].x,
                    y: game.players[currentPlayer].body[game.players[currentPlayer].body.length - 1].y
                });

                if (game.players.length > 6)
                    addFruit();

                socket.emit('newGameState', game);
                socket.broadcast.emit('newGameState', game);
            }
        }
        for (const i in game.players) {
            const player = game.players[i];
            if (player.id !== game.players[currentPlayer].id) {
                for (let j = 0; j < player.body.length; j++) {
                    if (game.players[currentPlayer].body[0].x === player.body[j].x && game.players[currentPlayer].body[0].y === player.body[j].y) {
                        //console.log(`> ${game.players[currentPlayer].id} mordeu ${player.id} e perdeu ${game.players[currentPlayer].points} pontos`);
                        player.points += game.players[currentPlayer].points;
                        for (let k = 1; k < game.players[currentPlayer].body.length - 2; k++) {
                            player.body.push(game.players[currentPlayer].body[k]);
                        }
                        game.players[currentPlayer].points = 0;
                        game.players[currentPlayer].body.splice(1, game.players[currentPlayer].body.length - 1);
                        socket.emit('newGameState', game);
                        socket.broadcast.emit('newGameState', game);
                    }
                }
            }
        }
    }

    socket.on("disconnect", () => {
        clearInterval(autoMove);
        console.log("\x1b[33m", '> ' + socket.id + ' = DISCONNECT', "\x1b[0m");
        game.players.splice(currentPlayer, 1);
        online = game.players.length;
        logOnline();
        socket.broadcast.emit('newGameState', game);
    });
});

server.listen(3000, (err) => {
    if (err) {
        console.log(err);
    }
    console.log('\x1b[36m%s\x1b[0m', '> SERVER LISTENING PORT 3000');
});
