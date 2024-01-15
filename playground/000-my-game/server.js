import express from 'express'
import http from 'http'
import createGame from './public/createGame.js'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))

const game = createGame()

game.addPlayer({ playerId: 'player1', playerX: 0, playerY: 0 })
game.addFruit({ fruitId: 'fruit1', fruitX: 0, fruitY: 1 })

io.on('connection', (socket) => {
  const playerId = socket.id;
  console.log('Player connected', playerId);

  socket.emit('setup', game.state)
})

server.listen(3000, () => {
  console.log('> Server listening on port 3000');
})