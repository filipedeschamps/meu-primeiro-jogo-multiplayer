import 'dart:convert';
import 'dart:ui';
import 'dart:math';

import 'package:flame/game.dart';
import 'package:flame/flame.dart';
import 'package:flutter/gestures.dart';

import 'package:game_flutter/components/background.dart';
import 'package:game_flutter/components/button-left.dart';
import 'package:game_flutter/components/fruit.dart';
import 'package:game_flutter/components/pac-base.dart';
import 'package:game_flutter/components/pacman-other.dart';
import 'package:game_flutter/components/pacman-player.dart';
import 'package:game_flutter/components/button-top.dart';
import 'package:game_flutter/components/button-right.dart';
import 'package:game_flutter/components/button-bottom.dart';
import 'package:game_flutter/socketio.dart';

class GameMain extends Game {
  SocketIo socket;
  Random rnd;
  Size screenSize;
  double tileSize;
  PacmanPlayer pacmanPlayer;
  PacmanOther pacmanOther;
  List<Fruit> fruits;

  List<PacmanBase> pacs;

  Background background;
  ButtonTop buttonTop;
  ButtonRight buttonRight;
  ButtonBottom buttonBottom;
  ButtonLeft buttonLeft;

  GameMain() {
    initialize();
  }

  void initialize() async {
    pacs = List<PacmanBase>();
    fruits = List<Fruit>();
    rnd = Random();
    SocketIo socket = SocketIo(this);

    resize(await Flame.util.initialDimensions());

    background = Background(this);

    pacmanPlayer = PacmanPlayer(0, 0, "", this);

    buttonTop = ButtonTop(this, pacmanPlayer);
    buttonRight = ButtonRight(this, pacmanPlayer);
    buttonBottom = ButtonBottom(this, pacmanPlayer);
    buttonLeft = ButtonLeft(this, pacmanPlayer);

    socket.createInstance();
  }

  @override
  void render(Canvas canvas) {
    background.render(canvas);

    fruits.forEach((Fruit fruit) => fruit.render(canvas));
    pacs.forEach((PacmanBase pac) => pac.render(canvas));

    buttonTop.render(canvas);
    buttonRight.render(canvas);
    buttonBottom.render(canvas);
    buttonLeft.render(canvas);
  }

  @override
  void update(double t) {
    pacs.forEach((PacmanBase pac) => pac.update(t));
  }

  void resize(Size size) {
    screenSize = size;
    tileSize = screenSize.width / 9;
  }

  void onTapDown(TapDownDetails d) {
    if (buttonTop.rect.contains(d.globalPosition)) {
      buttonTop.onTapDown();
    }

    if (buttonRight.rect.contains(d.globalPosition)) {
      buttonRight.onTapDown();
    }

    if (buttonBottom.rect.contains(d.globalPosition)) {
      buttonBottom.onTapDown();
    }

    if (buttonLeft.rect.contains(d.globalPosition)) {
      buttonLeft.onTapDown();
    }
  }

  spawnFruit(Map<String, dynamic> fruit) {
    double x = (fruit['x'] as int).toDouble();
    double y = (fruit['y'] as int).toDouble();

    fruits.add(Fruit(fruit['fruitId'], x, y, rnd.nextInt(3), this));
  }

  addPlayer(PacmanBase player) {
    print("Add Player");
    pacs.add(player);
    print("pacs ${pacs.length}");
  }

  removePlayer(String socketId) {
    pacs.removeWhere((pac) => pac.socketId == socketId);
  }

  addSocketPlayer(socketId) {
    pacmanPlayer.socketId = socketId;
    addPlayer(pacmanPlayer);
  }

  normalizeData(Map<String, dynamic> json) {
    normalizePlayers(json);
    normalizeFruits(json);
  }

  normalizePlayers(Map<String, dynamic> json) {
    try {
      final players = json['players'] as Map;
      players.forEach((key, value) {
        if (key != pacmanPlayer.socketId) {
          final state = value as Map;
          double x = (state['x'] as int).toDouble();
          double y = (state['y'] as int).toDouble();
          PacmanOther player = PacmanOther(x, y, key, this);
          player.score = state['score'];

          addPlayer(player);
        }
      });
    } catch (e) {
      print(e);
    }
  }

  normalizePlayer(Map<String, dynamic> playerState) {
    try {
      final state = playerState['newState'] as Map;

      double x = (state['x'] as int).toDouble();
      double y = (state['y'] as int).toDouble();
      String socketId = playerState['socketId'];

      int playerIndex = pacs.indexWhere((pac) => pac.socketId == socketId);

      if (playerIndex >= 0) {
        pacs[playerIndex].move(x, y);
        pacs[playerIndex].score = state['score'];
      } else {
        PacmanOther player = PacmanOther(x, y, socketId, this);
        player.score = state['score'];

        addPlayer(player);
      }
    } catch (e) {
      print(e);
    }
  }

  normalizeFruits(Map<String, dynamic> json) {
    try {
      final fruits = json['fruits'] as Map;
      fruits.forEach((key, value) {
        value['fruitId'] = int.parse(key);
        spawnFruit(value);
      });
    } catch (e) {
      print(e);
    }
  }
}
