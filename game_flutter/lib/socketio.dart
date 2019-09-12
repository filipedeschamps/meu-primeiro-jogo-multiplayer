import 'package:adhara_socket_io/adhara_socket_io.dart';
import 'package:game_flutter/game-main.dart';

class SocketIo {
  final GameMain game;
  SocketIO socket;

  SocketIo(this.game);

  createInstance() async {
    socket = await SocketIOManager()
        .createInstance(SocketOptions("http://10.0.0.17:8080"));

    initEvents();
    socket.connect();
  }

  initEvents() {
    socket.on("socketId", (socketId) {
      print("socketId: $socketId");
      game.addSocketPlayer(socketId);
    });

    socket.on("player-update", (player) {
      game.normalizePlayer(player);
    });

    socket.on("bootstrap", (data) {
      print("bootstrap $data");
      game.normalizeData(data);
    });

    socket.on("player-remove", (socketId) {
      print("Remove player");
      game.removePlayer(socketId);
    });

    socket.on("fruit-add", (fruit) {
      print("Fruit $fruit");
      game.spawnFruit(fruit);
    });
  }
}
