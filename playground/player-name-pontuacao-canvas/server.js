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
    sockets.emit(command.type, command);
})

sockets.on('connection',(socket)=>{
    const playerId = socket.id;    

    socket.on('create-player', (name)=>{
        game.addPlayer({ playerId, name });      
    });    
    
    socket.emit('setup', game.state);
    
    socket.on('disconnect', ()=>{
        console.log(`Disconected ${playerId}`);
        game.removePlayer({ playerId });        
        console.log(game.state);
    });
    
    socket.on('move-player', (command)=>{
        command.playerId = playerId;
        command.type = 'move-player';

        game.movePlayer(command);
    });
    
})

server.listen(3005, ()=>{
    console.log('\n> Server listening on port: 3005');
    console.log('> -------  http://localhost:3005\n');
    
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