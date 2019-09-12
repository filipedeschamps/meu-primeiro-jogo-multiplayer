import 'dart:ui';
import 'package:flame/sprite.dart';
import 'package:game_flutter/components/buttom-base.dart';
import 'package:game_flutter/components/pacman-player.dart';

import 'package:game_flutter/game-main.dart';
import 'package:game_flutter/pac-orientation.dart';

class ButtonBottom extends ButtonBase {
  ButtonBottom(GameMain game, PacmanPlayer pacman) : super(game, pacman) {
    width = game.tileSize * 1.2;
    height = game.tileSize * 1.2;

    rect = Rect.fromLTWH(
      (game.screenSize.width / 2) - (game.tileSize * .6),
      game.screenSize.height - height,
      width,
      height,
    );

    orientation = PacOrientation.bottom;

    sprite = Sprite('ui/control-bottom.png');
  }
}
