import 'dart:ui';
import 'package:flame/sprite.dart';
import 'package:game_flutter/components/buttom-base.dart';
import 'package:game_flutter/components/pacman-player.dart';

import 'package:game_flutter/game-main.dart';
import 'package:game_flutter/pac-orientation.dart';

class ButtonLeft extends ButtonBase {
  ButtonLeft(GameMain game, PacmanPlayer pacman) : super(game, pacman) {
    width = game.tileSize * 1.2;
    height = game.tileSize * 1.2;

    rect = Rect.fromLTWH(
      (game.screenSize.width / 2) - (width * 1.3),
      game.screenSize.height - (height * 2),
      width,
      height,
    );

    orientation = PacOrientation.left;

    sprite = Sprite('ui/control-left.png');
  }
}
