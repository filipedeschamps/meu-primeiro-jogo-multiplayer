import 'dart:ui';

import 'package:flame/sprite.dart';
import 'package:game_flutter/components/pac-base.dart';

import 'package:game_flutter/game-main.dart';
import 'package:game_flutter/pac-orientation.dart';

class PacmanPlayer extends PacmanBase {
  PacmanPlayer(double x, double y, String socketId, GameMain game)
      : super(x, y, socketId, game) {
    orientation = PacOrientation.right;
    width = (game.tileSize * .5).truncateToDouble();
    height = (game.tileSize * .5).truncateToDouble();

    pacRect = Rect.fromLTWH(
      x,
      y,
      width,
      height,
    );
    pacSpritesTop = List<Sprite>();
    pacSpritesRight = List<Sprite>();
    pacSpritesBottom = List<Sprite>();
    pacSpritesLeft = List<Sprite>();

    pacSpritesTop.add(Sprite('pac/pac-top.png'));
    pacSpritesTop.add(Sprite('pac/pac-top-eat.png'));

    pacSpritesRight.add(Sprite('pac/pac-right.png'));
    pacSpritesRight.add(Sprite('pac/pac-right-eat.png'));

    pacSpritesBottom.add(Sprite('pac/pac-bottom.png'));
    pacSpritesBottom.add(Sprite('pac/pac-bottom-eat.png'));

    pacSpritesLeft.add(Sprite('pac/pac-left.png'));
    pacSpritesLeft.add(Sprite('pac/pac-left-eat.png'));
  }
}
