import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import createGame from './public/game.js'

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)

app.use(express.static('public'))

const game = createGame((command) => {
    console.log(`> Emitting ${command.type}`)
    sockets.emit(command.type, command)
})

const frequency = 2000
setInterval(() => game.updateGame({ type: 'add-fruit' }), frequency)

sockets.on('connection', (socket) => {
    const playerId = socket.id
    console.log(`> Player connected: ${playerId}`)

    game.updateGame({ type: 'add-player', playerId: playerId })

    socket.emit('setup', game.state)

    socket.on('disconnect', () => {
        console.log(`> Player disconnected: ${playerId}`)
        game.updateGame({ type: 'remove-player', playerId: playerId })
    })

    socket.on('move-player', (command) => {
        game.updateGame(command)
    })
})

server.listen(3000, () => {
    console.log(`> Server listening on http://localhost:3000`)
})