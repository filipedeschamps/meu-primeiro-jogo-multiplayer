import express from 'express'
import http from 'http'
import createGame from './public/game.js'
import socketio from 'socket.io'

// camada de rede
const app = express()
const server = http.createServer(app)
const sockets = socketio(server)

const game = createGame()
game.start()

app.use(express.static('public'))

game.subscribe( (command) => {
    console.log(`> Emitting ${command.type}`)
    sockets.emit(command.type, command)
})

// Implementação do padrão de projeto: Event Emmiter
sockets.on('connection', (socket) => {
    socket.emit('setup', game.state)
    const playerId = socket.id
    console.log(`> Player connected with id: ${playerId}`)

    game.addPlayer( {playerId: playerId} )
    console.log(game.state)
    
    socket.on('disconnect', (socket) => {
        game.removePlayer( {playerId: playerId} )
        console.log(`> Player disconnected: ${playerId}`)
    })

    socket.on('move-player', (command) => {
        // lembrando que a informação que vem do cliente pode ser manipulada. Importante se prevenir!
        // procedimento banal de segurança
        command.playerId = playerId
        command.type = 'move-player'

        game.movePlayer(command)
    })
})

server.listen(3000, () => {
    console.log('> Server listening on port: 3000')
})