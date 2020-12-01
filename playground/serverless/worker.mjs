import HTML from "index.html";
import game from "game.js";
import keyboard_listener from "keyboard-listener.js";
import render_screen from "render-screen.js";
import socket_io from "socket.io.js";

async function handleErrors(request, func) {
  try {
    return await func();
  } catch (err) {
    if (request.headers.get("Upgrade") == "websocket") {
      let pair = new WebSocketPair();
      pair[1].accept();
      pair[1].send(JSON.stringify({error: err.stack}));
      pair[1].close(1011, "Uncaught exception during session setup");
      return new Response(null, { status: 101, webSocket: pair[0] });
    } else {
      return new Response(err.stack, {status: 500});
    }
  }
}

export default {
  async fetch(request, env) {
    return await handleErrors(request, async () => {
      let url = new URL(request.url);
      let path = url.pathname.slice(1).split('/');
      if (!path[0]) return new Response(HTML, {headers: {"Content-Type": "text/html;charset=UTF-8"}});
      switch (path[0]) {
        case "api":
          return handleApiRequest(path.slice(1), request, env);
        default:
          if (url.pathname == '/game.js') return new Response(game, {headers: {"Content-Type": "application/javascript; charset=utf-8"}});
          if (url.pathname == '/keyboard-listener.js') return new Response(keyboard_listener, {headers: {"Content-Type": "application/javascript; charset=utf-8"}});
          if (url.pathname == '/render-screen.js') return new Response(render_screen, {headers: {"Content-Type": "application/javascript; charset=utf-8"}});
          if (url.pathname == '/socket.io/socket.io.js') return new Response(socket_io, {headers: {"Content-Type": "application/javascript; charset=utf-8"}});
          return new Response("Not found", {status: 404});
      }
    });
  }
}
/*
async function handleApiRequest(path, request, env) {

  switch (path[0]) {
    case "room": {
      if (!path[1]) {
        if (request.method == "POST") {
          let id = env.rooms.newUniqueId();
          return new Response(id.toString(), {headers: {"Access-Control-Allow-Origin": "*"}});
        } else {
          return new Response("Method not allowed", {status: 405});
        }
      }

      let name = path[1];
      let id;
      if (name.match(/^[0-9a-f]{64}$/)) {
        id = env.rooms.idFromString(name);
      } else if (name.length <= 32) {
        id = env.rooms.idFromName(name);
      } else {
        return new Response("Name too long", {status: 404});
      }

      let roomObject = env.rooms.get(id);

      let newUrl = new URL(request.url);
      newUrl.pathname = "/" + path.slice(2).join("/");

      return roomObject.fetch(newUrl, request);
    }

    default:
      return new Response("Not found", {status: 404});
  }
}
*/
export class ChatRoom {
  constructor(controller, env) {
    this.storage = controller.storage;
    this.env = env;
    this.sessions = [];
  }

  createGame(storage) {
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 10,
            height: 10
        }
    }
  
    async function saveState() {
      await storage.put("GAME", state);
    }
  
    function start() {
        const frequency = 2000
        setInterval(addFruit, frequency)
    }
  
    function notifyAll(command) {
      broadcast(command);
    }
  
    function setState(newState) {
        Object.assign(state, newState)
    }
  
    async function addPlayer(command) {
        const playerId = command.playerId
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)
  
        state.players[playerId] = {
            x: playerX,
            y: playerY
        }
  
        notifyAll({
            type: 'add-player',
            playerId: playerId,
            playerX: playerX,
            playerY: playerY
        })

        await saveState();
    }
  
    async function removePlayer(command) {
        const playerId = command.playerId
  
        delete state.players[playerId]
  
        notifyAll({
            type: 'remove-player',
            playerId: playerId
        })

        await saveState();
    }
  
    async function addFruit(command) {
        if (Object.keys(state.fruits).length < 3) {
          const fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000)
          const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
          const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)
    
          state.fruits[fruitId] = {
              x: fruitX,
              y: fruitY
          }
    
          notifyAll({
              type: 'add-fruit',
              fruitId: fruitId,
              fruitX: fruitX,
              fruitY: fruitY
          })
  
          await saveState();
        }
    }
  
    async function removeFruit(command) {
        const fruitId = command.fruitId
  
        delete state.fruits[fruitId]
  
        notifyAll({
            type: 'remove-fruit',
            fruitId: fruitId,
        })

        await saveState();
    }
  
    async function movePlayer(command) {
        notifyAll(command)
  
        const acceptedMoves = {
            ArrowUp(player) {
                if (player.y - 1 >= 0) {
                    player.y = player.y - 1
                }
            },
            ArrowRight(player) {
                if (player.x + 1 < state.screen.width) {
                    player.x = player.x + 1
                }
            },
            ArrowDown(player) {
                if (player.y + 1 < state.screen.height) {
                    player.y = player.y + 1
                }
            },
            ArrowLeft(player) {
                if (player.x - 1 >= 0) {
                    player.x = player.x - 1
                }
            }
        }
  
        const keyPressed = command.keyPressed
        const playerId = command.playerId
        const player = state.players[playerId]
        const moveFunction = acceptedMoves[keyPressed]
  
        if (player && moveFunction) {
            moveFunction(player)
            await checkForFruitCollision(playerId)
        }
  
    }
  
    async function checkForFruitCollision(playerId) {
        const player = state.players[playerId]
  
        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId]
            console.log(`Checking ${playerId} and ${fruitId}`)
  
            if (player.x === fruit.x && player.y === fruit.y) {
                console.log(`COLLISION between ${playerId} and ${fruitId}`)
                await removeFruit({ fruitId: fruitId })
            }
        }
    }
  
    return {
        addPlayer,
        removePlayer,
        movePlayer,
        addFruit,
        removeFruit,
        state,
        setState,
        start
    }
  }

  async fetch(request) {
    return await handleErrors(request, async () => {
      let url = new URL(request.url);
      if (url.pathname.indexOf('/websocket') != -1) {
        // The request is to `/api/room/<name>/websocket`. A client is trying to establish a new
        // WebSocket session.
        if (request.headers.get("Upgrade") != "websocket") {
          return new Response("expected websocket", {status: 400});
        }

        // Get the client's IP address for use with the rate limiter.
        let ip = request.headers.get("CF-Connecting-IP");

        // To accept the WebSocket request, we create a WebSocketPair (which is like a socketpair,
        // i.e. two WebSockets that talk to each other), we return one end of the pair in the
        // response, and we operate on the other end. Note that this API is not part of the
        // Fetch API standard; unfortunately, the Fetch API / Service Workers specs do not define
        // any way to act as a WebSocket server today.
        let pair = new WebSocketPair();

        // We're going to take pair[1] as our end, and return pair[0] to the client.
        await this.handleSession(pair[1], ip);

        // Now we return the other end of the pair to the client.
        return new Response(null, { status: 101, webSocket: pair[0] });
      } else {
        return new Response("Not found", {status: 404});
      }
    });
  }

  async handleSession(webSocket, ip) {

    webSocket.accept();

    let session = {webSocket};
    this.sessions.push(session);

    const game = this.createGame(this.storage);
    const game_data = await this.storage.get("GAME");
    if (game_data != null) game.setState(game_data);
    game.start();

    const playerId =  Math.random();
    await game.addPlayer({ playerId: playerId });

    webSocket.send(JSON.stringify({emit: "setup", data:game.state}));

    webSocket.addEventListener("message", async msg => {
      try {
        if (session.quit) {
          webSocket.close(1011, "WebSocket broken.");
          return;
        }
        let data = JSON.parse(msg.data);
        if (data.emit == 'move-player') {
          data.data.playerId = playerId;
          data.data.type = 'move-player';
          await game.movePlayer(data.data);
        }
      } catch (err) {
        webSocket.send(JSON.stringify({error: err.stack}));
      }
    });

    let closeOrErrorHandler = async evt => {
      session.quit = true;
      this.sessions = this.sessions.filter(member => member !== session);
      await game.removePlayer({ playerId: playerId });
    };
    webSocket.addEventListener("close", closeOrErrorHandler);
    webSocket.addEventListener("error", closeOrErrorHandler);
  }

  broadcast(message) {
    let quitters = [];
    this.sessions = this.sessions.filter(session => {
      try {
        session.webSocket.send(message);
        return true;
      } catch (err) {
        session.quit = true;
        quitters.push(session);
        return false;
      }
    });
    quitters.forEach(quitter => {
      if (quitter.name) {
        this.broadcast({quit: quitter.name});
      }
    });
  }
}
