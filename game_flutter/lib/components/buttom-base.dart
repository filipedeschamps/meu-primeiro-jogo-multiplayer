import 'dart:ui';
import 'package:flame/sprite.dart';
import 'package:game_flutter/components/pacman-player.dart';

import 'package:game_flutter/game-main.dart';
import 'package:game_flutter/pac-orientation.dart';

class ButtonBase {
  final GameMain game;
  final PacmanPlayer pacman;
  PacOrientation orientation;
  double width;
  double height;
  Rect rect;
  Sprite sprite;

  ButtonBase(this.game, this.pacman);

  void render(Canvas c) {
    sprite.renderRect(c, rect);
  }

  void update(double t) {}

  void onTapDown() {
    pacman.onChangePacOrientation(orientation);
  }
}
