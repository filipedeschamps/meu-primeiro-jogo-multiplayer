import 'dart:ui';

import 'package:game_flutter/game-main.dart';

class Background {
  final GameMain game;
  Rect bgRect;
  Paint bgPaint;

  Background(this.game) {
    bgRect = Rect.fromLTWH(
      0,
      0,
      game.screenSize.width,
      game.screenSize.height,
    );
    bgPaint = Paint();
    bgPaint.color = Color(0xff576574);
  }

  void render(Canvas c) {
    c.drawRect(bgRect, bgPaint);
  }

  void update(double t) {}
}
