import 'dart:ui';

import 'package:flame/sprite.dart';
import 'package:game_flutter/components/pac-base.dart';

import 'package:game_flutter/game-main.dart';
import 'package:game_flutter/pac-orientation.dart';

class PacmanOther extends PacmanBase {
  PacmanOther(double x, double y, String socketId, GameMain game)
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

    pacSpritesTop.add(Sprite('pac/pac-top-gray.png'));
    pacSpritesTop.add(Sprite('pac/pac-top-eat-gray.png'));

    pacSpritesRight.add(Sprite('pac/pac-right-gray.png'));
    pacSpritesRight.add(Sprite('pac/pac-right-eat-gray.png'));

    pacSpritesBottom.add(Sprite('pac/pac-bottom-gray.png'));
    pacSpritesBottom.add(Sprite('pac/pac-bottom-eat-gray.png'));

    pacSpritesLeft.add(Sprite('pac/pac-left-gray.png'));
    pacSpritesLeft.add(Sprite('pac/pac-left-eat-gray.png'));
  }
}
