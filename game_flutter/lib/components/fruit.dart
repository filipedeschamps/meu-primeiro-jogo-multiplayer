import 'dart:ui';

import 'package:flame/sprite.dart';

import 'package:game_flutter/game-main.dart';

class Fruit {
  final GameMain game;
  Rect fruitRect;
  Sprite fruitSprites;
  int id;
  double width;
  double height;

  Fruit(this.id, double x, double y, int sprite, this.game) {
    width = (game.tileSize * .5).truncateToDouble();
    height = (game.tileSize * .5).truncateToDouble();

    fruitRect = Rect.fromLTWH(
      x,
      y,
      width,
      height,
    );

    switch (sprite) {
      case 0:
        fruitSprites = Sprite('pac/apple.png');
        break;
      case 1:
        fruitSprites = Sprite('pac/banana.png');
        break;
      case 2:
        fruitSprites = Sprite('pac/cherry.png');
        break;
      default:
        fruitSprites = Sprite('pac/apple.png');
    }
  }

  void render(Canvas c) {
    fruitSprites.renderRect(c, fruitRect);
  }

  void update(double t) {}
}
