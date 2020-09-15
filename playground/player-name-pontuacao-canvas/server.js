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
        game.removePlayer({ playerId });                
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
