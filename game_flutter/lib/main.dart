import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:flame/util.dart';
import 'package:flame/flame.dart';

import 'package:game_flutter/game-main.dart';

void main() async {
  Util flameUtil = Util();
  await flameUtil.fullScreen();
  await flameUtil.setOrientation(DeviceOrientation.portraitUp);

  Flame.images.loadAll(<String>[
    'pac/pac-right.png',
    'pac/pac-right-eat.png',
    'pac/pac-right-gray.png',
    'pac/pac-right-eat-gray.png',
    'pac/pac-left.png',
    'pac/pac-left-eat.png',
    'pac/pac-left-gray.png',
    'pac/pac-left-eat-gray.png',
    'pac/pac-top.png',
    'pac/pac-top-eat.png',
    'pac/pac-top-gray.png',
    'pac/pac-top-eat-gray.png',
    'pac/pac-bottom.png',
    'pac/pac-bottom-eat.png',
    'pac/pac-bottom-gray.png',
    'pac/pac-bottom-eat-gray.png',
    'ui/control-top.png',
    'ui/control-right.png',
    'ui/control-bottom.png',
    'ui/control-left.png',
  ]);

  GameMain game = GameMain();

  runApp(game.widget);
  TapGestureRecognizer tapper = TapGestureRecognizer();
  tapper.onTapDown = game.onTapDown;
  flameUtil.addGestureRecognizer(tapper);
}
