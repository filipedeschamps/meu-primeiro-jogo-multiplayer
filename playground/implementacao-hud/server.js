import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import createGame from './public/game.js';

const app = express();
const server = http.createServer(app);
const sockets = socketio(server);

app.use(express.static('public'));

const game = createGame(); 
game.start();

game.subscribe((command) => {
    // console.log(`> Emiting ${command.type}`);
    sockets.emit(command.type, command);
})

sockets.on('connection',(socket)=>{
    const playerId = socket.id;
    // console.log(`> Player connected on Server with id: ${playerId}`);

    game.addPlayer({ playerId });
    
    socket.emit('setup', game.state);
    
    socket.on('disconnect', ()=>{
        game.removePlayer({ playerId });
        console.log(`> Player ${playerId} Disconected `);
        console.log('\n');
        console.log(game.state);
        console.log('\n');
    });
    
    socket.on('move-player', (command)=>{
        command.playerId = playerId;
        command.type = 'move-player';

        game.movePlayer(command);
    });

    console.log('\n');
    console.log(game.state);
    console.log('\n');
})

server.listen(3000, ()=>{
    console.log('\n> Server listening on port: 3000');
    console.log('> -------  http://localhost:3000\n');
    
});


/**
 * 1 - Reajustar tamanho do canvas com informações vindas do servidor
 * 2 - Fazer "unsubscribe" dos observers (caso conexão cair)
 * 3 - Implementar sistema de pontuação
 * 4 - Emitir som a cada ponto marcado e um som diferente a cada 100 pontos marcados
 * 5 - Fazer jogador dar a volta no canvas
 * 6 - Refatorar funções anônimas 
 * 7 - Filtrar os comandos enviados ao backend
 * 8 - Gitpod com versão fica do nodejs
 * 
 */