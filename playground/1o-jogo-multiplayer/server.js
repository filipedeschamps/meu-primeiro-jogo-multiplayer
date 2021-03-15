import express from 'express'
import http from 'http'
import createGame from './public/game.js'
import socketio from 'socket.io'

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)

app.use(express.static('public'))

const game = createGame()
game.addPlayer({ playerId: 'player1', playerX: 0, playerY: 0 })
game.addPlayer({ playerId: 'player2', playerX: 7, playerY: 0 })
game.addPlayer({ playerId: 'player3', playerX: 9, playerY: 0 })
game.addFruit({ fruitId: 'fruit1', fruitX: 3, fruitY: 3 })
game.addFruit({ fruitId: 'fruit2', fruitX: 3, fruitY: 5 })

sockets.on('connection', (socket) => {
    const playerId = socket.fruitId
    console.log(`> Player connected on Server with id: ${playerId}`)

    socket.emit('setup', game.state)
})

server.listen(3000, () => {
    console.log(`> Server listening on port: 3000`)
})