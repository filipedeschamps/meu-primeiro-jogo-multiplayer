import 'dart:ui';

import 'package:flame/sprite.dart';

import 'package:game_flutter/game-main.dart';
import 'package:game_flutter/pac-orientation.dart';

class PacmanBase {
  final GameMain game;
  Rect pacRect;
  String socketId;
  List<Sprite> pacSpritesTop;
  List<Sprite> pacSpritesRight;
  List<Sprite> pacSpritesBottom;
  List<Sprite> pacSpritesLeft;

  double pacSpriteIndex = 0;
  PacOrientation orientation;
  Offset targetLocation;
  double x;
  double y;
  double width;
  double height;
  int score = 0;

  PacmanBase(this.x, this.y, this.socketId, this.game);

  void render(Canvas c) {
    switch (orientation) {
      case PacOrientation.top:
        pacSpritesTop[pacSpriteIndex.toInt()].renderRect(
          c,
          pacRect,
        );
        break;
      case PacOrientation.right:
        pacSpritesRight[pacSpriteIndex.toInt()].renderRect(
          c,
          pacRect,
        );
        break;
      case PacOrientation.bottom:
        pacSpritesBottom[pacSpriteIndex.toInt()].renderRect(
          c,
          pacRect,
        );
        break;
      case PacOrientation.left:
        pacSpritesLeft[pacSpriteIndex.toInt()].renderRect(
          c,
          pacRect,
        );
        break;
      default:
    }
  }

  void update(double t) {
    pacSpriteIndex += 10 * t;
    if (pacSpriteIndex >= 2) {
      pacSpriteIndex -= 2;
    }
  }

  void onChangePacOrientation(PacOrientation pacOrientation) {
    orientation = pacOrientation;

    switch (orientation) {
      case PacOrientation.top:
        move(pacRect.left, pacRect.top - height);
        break;
      case PacOrientation.right:
        move(pacRect.left + width, pacRect.top);
        break;
      case PacOrientation.bottom:
        move(pacRect.left, pacRect.top + height);
        break;
      case PacOrientation.left:
        move(pacRect.left - width, pacRect.top);
        break;
      default:
    }
  }

  move(double x, double y) {
    targetLocation = Offset(x, y);

    Offset toTarget = targetLocation - Offset(pacRect.left, pacRect.top);

    if (game.screenSize.contains(targetLocation)) {
      pacRect = pacRect.shift(toTarget);
    }
  }

  @override
  String toString() => "X: $x, Y: $y, Score: $score, socketId: $socketId";
}
