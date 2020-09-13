import express from 'express'
import http from 'http'
import createGame from './public/game.js'
import socketio from 'socket.io'
import createForum from './public/integration.js'

// camada de rede
const app = express()
const server = http.createServer(app)
const sockets = socketio(server)
const forum = createForum()

const game = createGame(forum)
game.spawnFruits()

app.use(express.static('public'))

const notifyForum = forum.subscribe('server', (command) => {
    console.log(`[server]> Emitting ${command.type}`)
    sockets.emit(command.type, command)
})

// Implementação do padrão de projeto: Event Emmiter
sockets.on('connection', (socket) => {
    socket.emit('setup', game.state)
    const playerId = socket.id
    console.log(`[server]> Player connected with id: ${playerId}`)

    game.addPlayer( {playerId: playerId} )
    console.log(game.state)
    
    socket.on('disconnect', (socket) => {
        game.removePlayer( {playerId: playerId} )
        console.log(`[server]> Player disconnected: ${playerId}`)
    })

    socket.on('move_player', (command) => {
        // lembrando que a informação que vem do cliente pode ser manipulada. Importante se prevenir!
        // procedimento banal de segurança
        command.playerId = playerId
        command.type = 'move_player'

        // Notifica os outros jogadores que este se moveu
        sockets.emit('move_player', command)

        // Atualiza o estado interno do jogo pelo forum
        notifyForum(command)
    })
})

server.listen(3000, () => {
    console.log('[server]> Server listening on port: 3000')
})