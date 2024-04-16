import kaboom from "kaboom";

kaboom({
  background: [134, 135, 247],
  fullscreen: true,
  scale: 2,
});

const TIME_LEFT = 15 * 3;
const BULLET_SPEED = 200;
const directions = {
  LEFT: "left",
  RIGHT: "right",
};

let current_direction = directions.RIGHT;

loadRoot("sprites/");
loadAseprite("mario", "Mario.png", "Mario.json");
loadAseprite("enemies", "enemies.png", "enemies.json");
loadSprite("ground", "ground.png");
loadSprite("questionBox", "questionBox.png");
loadSprite("emptyBox", "emptyBox.png");
loadSprite("brick", "brick.png");
loadSprite("coin", "coin.png");
loadSprite("bigMushy", "bigMushy.png");
loadSprite("pipeTop", "pipeTop.png");
loadSprite("pipeBottom", "pipeBottom.png");
loadSprite("shrubbery", "shrubbery.png");
loadSprite("hill", "hill.png");
loadSprite("cloud", "cloud.png");
loadSprite("castle", "castle.png");

loadSprite("injection", "coin.png");

loadRoot("sprites/controls/");
loadSprite("arrow-up", "arrow-circle-up-solid.svg");
loadSprite("arrow-down", "arrow-circle-down-solid.svg");
loadSprite("arrow-left", "arrow-circle-left-solid.svg");
loadSprite("arrow-right", "arrow-circle-right-solid.svg");

loadRoot("sounds/");
loadSound("score", "score.mp3");
loadSound("powerup", "powerup.mp3");
loadSound("blip", "blip.mp3");
loadSound("hit", "hit.mp3");
loadSound("castle", "portal.mp3");

loadSound("shoot", "shoot.mp3");
loadSound("explosion", "explode.mp3");

loadSound("OtherworldlyFoe", "OtherworldlyFoe.mp3");

const LEVELS = [
  [
    "                 ",
    "                 ",
    "                 ",
    "                 ",
    "                 ",
    "                 ",
    "       ?  ?  ?   ",
    "G                ",
    "=================",
    "=================",
  ],
  [
    "                                                                                                ",
    "                   ?                                                                           ",
    "                   -                                                                           ",
    "                                                                                             G ",
    "                   G                                                                           ",
    "              -?-b-                                           -?-b-                            ",
    "             ------                                          ------                            ",
    "====================     ======================================================================",
    "====================     ======================================================================",
  ],
  [
    "                                                                                                ",
    "                                ?                                                               ",
    "                                -                                                               ",
    "                                                                                                ",
    "                                                                                           G   ",
    "              C                  -?-b-                                                          ",
    "             ----               ------                                                          ",
    "====================     ======================================================================",
    "====================     ======================================================================",
  ],
  [
    "                                                                                                ",
    "                           ?                                                                    ",
    "                           -                  G                                                 ",
    "                                                  K                                             ",
    "             C                  -?-b-                                 K                          ",
    "            ----               ------                                                            ",
    "====================     ======================================================================",
    "====================     ======================================================================",
  ],
  [
    "                                                                                                ",
    "                ?    K                                                                         ",
    "                -                                                                              ",
    "                                                   K                                           ",
    "     G          C                  -?-b-                                                       ",
    "    --         ----               ------                                                       ",
    "====================     ======================================================================",
    "====================     ======================================================================",
  ],
];


const levelConf = {
  // grid size
  width: 16,
  height: 16,
  pos: vec2(0, 0),
  // define each object as a list of components
  "=": () => [sprite("ground"), area(), solid(), origin("bot"), "ground"],
  "-": () => [sprite("brick"), area(), solid(), origin("bot"), "brick"],
  C: () => [
    sprite("castle"),
    area({ width: 1, height: 240 }),
    origin("bot"),
    "castle",
  ],
  "?": () => [
    sprite("questionBox"),
    area(),
    solid(),
    origin("bot"),
    "questionBox",
    "coinBox",
  ],
  b: () => [
    sprite("questionBox"),
    area(),
    solid(),
    origin("bot"),
    "questionBox",
    "mushyBox",
  ],
  g: () => [
    sprite("questionBox"),
    area(),
    solid(),
    origin("bot"),
    "questionBox",
    "flameBox",
  ],
  "!": () => [
    sprite("emptyBox"),
    area(),
    solid(),
    bump(),
    origin("bot"),
    "emptyBox",
  ],
  c: () => [
    sprite("coin"),
    area(),
    solid(),
    bump(64, 8),
    cleanup(),
    lifespan(0.4, { fade: 0.01 }),
    origin("bot"),
    "coin",
  ],
  M: () => [
    sprite("bigMushy"),
    area(),
    solid(),
    patrol(10000),
    body(),
    cleanup(),
    origin("bot"),
    "bigMushy",
  ],
  F: () => [
    sprite("bigMushy"),
    area(),
    solid(),
    patrol(10000),
    body(),
    cleanup(),
    origin("bot"),
    "flame",
  ],
  "|": () => [sprite("pipeBottom"), area(), solid(), origin("bot"), "pipe"],
  _: () => [sprite("pipeTop"), area(), solid(), origin("bot"), "pipe"],
  G: () => [
    sprite("enemies", { anim: "Walking" }),
    area({ width: 16, height: 16 }),
    solid(),
    body(),
    patrol(50),
    enemy(1),
    origin("bot"),
    "goomba",
  ],
  K: () => [
    sprite("enemies", { anim: "Walk" }),
    area({ width: 16, height: 16 }),
    solid(),
    body(),
    patrol(50),
    enemy(2),
    origin("bot"),
    "koopa",
  ],
  H: () => [
    sprite("enemies", { anim: "WalkHB" }),
    area({ width: 16, height: 16 }),
    solid(),
    body(),
    patrol(50),
    enemy(3),
    origin("bot"),
    "hamerbro",
  ],
  p: () => [
    sprite("mario", { frame: 0 }),
    area({ width: 16, height: 16 }),
    body(),
    mario(),
    bump(150, 20, false),
    origin("bot"),
    "player",
  ],
};

function leftFillNum(num, targetLenStr) {
  var targetLength = targetLenStr.length;
  return num.toString().padStart(targetLength, 0);
}

scene("start", () => {
  add([
    text("Click to start", { size: 24 }),
    pos(center()),
    origin("center"),
    color(255, 255, 255),
  ]);

  keyRelease("enter", () => {
    go("game");
    fullscreen(!fullscreen());
  });

  onClick(() => {
    go("game");
    fullscreen(!fullscreen());
  });
});

go("start");

scene("game", (levelNumber = 0, score = 0, overallScore = 0) => {
  layers(["bg", "game", "ui"], "game");

  const level = addLevel(LEVELS[levelNumber], levelConf);

  add([sprite("cloud"), pos(20, 50), layer("bg")]);

  add([sprite("hill"), pos(32, 208), layer("bg"), origin("bot")]);

  add([sprite("shrubbery"), pos(200, 208), layer("bg"), origin("bot")]);

  add([
    text("Level " + (levelNumber + 1), { size: 24 }),
    pos(vec2(160, 120)),
    color(255, 255, 255),
    origin("center"),
    layer("ui"),
    lifespan(1, { fade: 0.5 }),
  ]);

  const music = play("OtherworldlyFoe", { loop: true });

  music.volume(0.5);

  const overallScoreLabel = add([
    text(`MARIO\n000000`, { size: 15 }),
    pos(30, 6),
    fixed(),
    layer("ui"),
    {
      value: overallScore,
    },
  ]);

  const scoreLabel = add([
    text("x" + score, { size: 15 }),
    pos(160, 6),
    fixed(),
    layer("ui"),
    {
      value: score,
    },
  ]);

  const coinImg = add([sprite("coin"), pos(160 - 15, 3), fixed(), layer("ui")]);

  // const builder = add([
  // 	rect(55, 20),
  // 	pos(350, 6),
  // 	// sprite("surprise"),
  // 	"button",
  // 	{
  // 		clickAction: () => window.open("builder.html", "_blank"),
  // 	},
  // ]);

  // add([text("Builder"), pos(350, 6), color(0, 0, 0)]);

  add([
    text(`WORLD\n${levelNumber + 1}-${LEVELS.length}`, { size: 15 }),
    pos(240, 6),
    fixed(),
  ]);

  const timer = add([
    text("TIME\n0", { size: 15 }),
    pos(360, 6),
    fixed(),
    {
      time: TIME_LEFT,
    },
  ]);

  timer.action(() => {
    timer.time -= dt();
    timer.text = "TIME\n" + Math.round(timer.time.toFixed(2));
    if (timer.time <= 0) {
      music.stop();
      timer.time = 0;
      killed();
    }
  });

  const player = level.spawn("p", 1, 10);

  const SPEED = 120;

  function CharacterMovement() {
    // Example
    // createArrow('arrow-up', 'up', width() - 50, height() - 55)

    createArrow("arrow-up", "up", width() - 50, height() - 55, player);
    createArrow("arrow-down", "down", width() - 50, height() - 32, player);
    createArrow("arrow-left", "left", width() - 75, height() - 32, player);
    createArrow("arrow-right", "right", width() - 25, height() - 32, player);

    // Touch
    //   onClick(up, run);
    //   onClick(down, run);
    //   onClick(left, run);
    //   onClick(right, run);
  }

  function run(key) {
    if (key === "up") {
      if (player.isAlive && player.grounded()) {
        player.jump();
        canSquash = true;
      }
    } else if (key === "down") {
    } else if (key === "left") {
      if (player.isFrozen) return;
      player.flipX(true);
      if (toScreen(player.pos).x > 20) {
        player.move(-SPEED, 0);
      }
    } else if (key === "right") {
      if (player.isFrozen) return;
      player.flipX(false);
      player.move(SPEED, 0);
      overallScoreLabel.value += 1;
      overallScoreLabel.text =
        "MARIO\n" + leftFillNum(overallScoreLabel.value, "000000");
    }
  }

  function createArrow(spriteName, key, x, y) {
    const arrow = add([
      sprite(spriteName),
      pos(x, y),
      area({ cursor: "pointer" }),
      scale(0.5),
      fixed(),
      opacity(1),
    ]);

    window[key] = arrow;
    var walk;
    onMousePress(() => {
      let position = mousePos();
      if (
        position.x > arrow.pos.x - arrow.width / 2 &&
        position.x < arrow.pos.x + arrow.width / 2 &&
        position.y > arrow.pos.y - arrow.height / 2 &&
        position.y < arrow.pos.y + arrow.height / 2
      ) {
        walk = setInterval(() => run(key), 50);
      }
    });

    onMouseRelease(() => clearInterval(walk));

    arrow.onUpdate(() => {
      if (arrow.isHovering()) {
        arrow.opacity = 0.5;
      } else {
        arrow.opacity = 1;
      }
    });

    return arrow;
  }

  CharacterMovement();

  keyDown("right", () => {
    if (player.isFrozen) return;
    player.flipX(false);
    current_direction = directions.RIGHT;
    player.move(SPEED, 0);
    overallScoreLabel.value += 1;
    overallScoreLabel.text =
      "MARIO\n" + leftFillNum(overallScoreLabel.value, "000000");
  });

  keyDown("left", () => {
    if (player.isFrozen) return;
    player.flipX(true);
    current_direction = directions.LEFT;
    if (toScreen(player.pos).x > 20) {
      player.move(-SPEED, 0);
    }
  });

  keyPress("space", () => {
    if (player.isAlive && player.grounded()) {
      player.jump();
      canSquash = true;
    }
  });

  player.action(() => {
    // center camera to player
    var currCam = camPos();
    if (currCam.x < player.pos.x) {
      camPos(player.pos.x, currCam.y);
    }

    if (player.isAlive && player.grounded()) {
      canSquash = false;
    }

    // Check if Mario has fallen off the screen
    if (player.pos.y > height() - 16) {
      music.stop();
      killed();
    }
  });

  let coinPitch = 0;

  action(() => {
    if (coinPitch > 0) {
      coinPitch = Math.max(0, coinPitch - dt() * 100);
    }
  });

  let canSquash = false;

  player.collides("goomba", (goomba) => {
    if (goomba.isAlive == false) return;
    if (player.isAlive == false) return;
    if (canSquash) {
      // Mario has jumped on the bad guy:
      goomba.squash();
      play("powerup");
    } else {
      // Mario has been hurt
      if (player.isBig) {
        player.smaller();
      } else if (player.isFire) {
        player.bigger();
      } else {
        // Mario is dead :(
        music.stop();
        killed();
      }
    }
  });

  player.collides("koopa", (koopa) => {
    if (koopa.isAlive == false) return;
    if (player.isAlive == false) return;
    if (canSquash) {
      // Mario has jumped on the bad guy:
      koopa.squash();
      play("powerup");
    } else {
      // Mario has been hurt
      if (player.isBig) {
        player.smaller();
      } else if (player.isFire) {
        player.bigger();
      } else {
        // Mario is dead :(
        music.stop();
        killed();
      }
    }
  });

  player.collides("hamerbro", (hamerbro) => {
    if (hamerbro.isAlive == false) return;
    if (player.isAlive == false) return;
    if (canSquash) {
      // Mario has jumped on the bad guy:
      hamerbro.squash();
      play("powerup");
    } else {
      // Mario has been hurt
      if (player.isBig) {
        player.smaller();
      } else if (player.isFire) {
        player.bigger();
      } else {
        // Mario is dead :(
        music.stop();
        killed();
      }
    }
  });

  function spawnBullet(bulletpos) {
    if (current_direction == directions.LEFT) {
      bulletpos = bulletpos.sub(10, 0);
    } else if (current_direction == directions.RIGHT) {
      bulletpos = bulletpos.add(10, 0);
    }
    add([
      sprite("injection"),
      scale(0.5),
      pos(bulletpos),
      area(),
      origin("center"),
      "bullet",
      {
        bulletSpeed:
          current_direction == directions.LEFT
            ? -1 * BULLET_SPEED
            : BULLET_SPEED,
      },
    ]);

    play("shoot", {
      volume: 0.2,
      detune: rand(-1200, 1200),
    });
  }

  action("bullet", (b) => {
    b.move(b.bulletSpeed, 0);
    if (b.pos.x < 0) {
      destroy(b);
    }
  });

  keyPress("up", () => {
    if (player.isFire) {
      spawnBullet(player.pos);
    }
  });

  collides("bullet", "goomba", (bullet, goomba) => {
    destroy(bullet);
    destroy(goomba);
    shake(4);
    play("explosion", {
      volume: 0.2,
      detune: rand(0, 1200),
    });
  });

  collides("bullet", "koopa", (bullet, koopa) => {
    destroy(bullet);
    destroy(koopa);
    shake(4);
    play("explosion", {
      volume: 0.2,
      detune: rand(0, 1200),
    });
  });

  collides("bullet", "hamerbro", (bullet, hamerbro) => {
    destroy(bullet);
    destroy(hamerbro);
    shake(4);
    play("explosion", {
      volume: 0.2,
      detune: rand(0, 1200),
    });
  });

  function killed() {
    // Mario is dead :(
    if (player.isAlive == false) return; // Don't run it if mario is already dead
    player.die();
    add([
      text("Game Over :(", { size: 24 }),
      pos(toWorld(vec2(160, 120))),
      color(255, 255, 255),
      origin("center"),
      layer("ui"),
    ]);
    wait(2, () => {
      go("start");
    });
  }

  player.on("headbutt", (obj) => {
    if (obj.is("questionBox")) {
      play("blip");
      if (obj.is("coinBox")) {
        let coin = level.spawn("c", obj.gridPos.sub(0, 1));
        coin.bump();
        play("score", {
          detune: coinPitch,
        });
        coinPitch += 100;
        scoreLabel.value++;
        scoreLabel.text = "x" + scoreLabel.value;
      } else if (obj.is("mushyBox")) {
        level.spawn("M", obj.gridPos.sub(0, 1));
      } else if (obj.is("flameBox")) {
        level.spawn("F", obj.gridPos.sub(0, 1));
      }
      var pos = obj.gridPos;
      destroy(obj);
      var box = level.spawn("!", pos);
      box.bump();
    }
  });

  player.collides("bigMushy", (mushy) => {
    destroy(mushy);
    player.bigger();
    play("powerup");
    overallScoreLabel.value += 100;
    overallScoreLabel.text =
      "MARIO\n" + leftFillNum(overallScoreLabel.value, "000000");
  });

  player.collides("flame", (flame) => {
    destroy(flame);
    player.fire();
    play("powerup");
    overallScoreLabel.value += 200;
    overallScoreLabel.text =
      "MARIO\n" + leftFillNum(overallScoreLabel.value, "000000");
  });

  player.collides("castle", (castle, side) => {
    timer.time = TIME_LEFT;
    player.freeze();
    add([
      text("Well Done!", { size: 24 }),
      pos(toWorld(vec2(160, 120))),
      color(255, 255, 255),
      origin("center"),
      layer("ui"),
    ]);
    play("castle");
    music.stop();
    wait(1, () => {
      let nextLevel = levelNumber + 1;

      if (nextLevel >= LEVELS.length) {
        go("start");
      } else {
        go("game", nextLevel);
      }
    });
  });
});

function patrol(distance = 100, speed = 50, dir = 1) {
  return {
    id: "patrol",
    require: ["pos", "area"],
    startingPos: vec2(0, 0),
    add() {
      this.startingPos = this.pos;
      this.on("collide", (obj, side) => {
        if (side === "left" || side === "right") {
          dir = -dir;
        }
      });
    },
    update() {
      if (Math.abs(this.pos.x - this.startingPos.x) >= distance) {
        dir = -dir;
      }
      this.move(speed * dir, 0);
    },
  };
}

function enemy(enemy = 1) {
  return {
    id: "enemy",
    require: ["pos", "area", "sprite", "patrol"],
    isAlive: true,
    update() {},
    squash() {
      console.log("squashing", enemy);
      this.isAlive = false;
      this.unuse("patrol");
      this.stop();
      enemy === 1
        ? (this.frame = 2)
        : enemy === 2
        ? (this.frame = 5)
        : (this.frame = 12);
      this.area.width = 16;
      this.area.height = 8;
      this.use(lifespan(0.5, { fade: 0.1 }));
    },
  };
}

function bump(offset = 8, speed = 2, stopAtOrigin = true) {
  return {
    id: "bump",
    require: ["pos"],
    bumpOffset: offset,
    speed: speed,
    bumped: false,
    origPos: 0,
    direction: -1,
    update() {
      if (this.bumped) {
        this.pos.y = this.pos.y + this.direction * this.speed;
        if (this.pos.y < this.origPos - this.bumpOffset) {
          this.direction = 1;
        }
        if (stopAtOrigin && this.pos.y >= this.origPos) {
          this.bumped = false;
          this.pos.y = this.origPos;
          this.direction = -1;
        }
      }
    },
    bump() {
      this.bumped = true;
      this.origPos = this.pos.y;
    },
  };
}

function mario() {
  return {
    id: "mario",
    require: ["body", "area", "sprite", "bump"],
    smallAnimation: "Running",
    bigAnimation: "RunningBig",
    fireAnimation: "FlamingMario",
    smallStopFrame: 0,
    bigStopFrame: 8,
    fireStopFrame: 17,
    smallJumpFrame: 5,
    bigJumpFrame: 13,
    fireJumpFrame: 22,
    isBig: false,
    isFire: false,
    isFrozen: false,
    isAlive: true,
    update() {
      if (this.isFrozen) {
        this.standing();
        return;
      }

      if (!this.grounded()) {
        this.jumping();
      } else {
        if (keyIsDown("left") || keyIsDown("right")) {
          this.running();
        } else {
          this.standing();
        }
      }
    },
    bigger() {
      this.isBig = true;
      this.isFire = false;
      this.area.width = 24;
      this.area.height = 32;
    },
    fire() {
      this.isBig = false;
      this.isFire = true;
      this.area.width = 24;
      this.area.height = 32;
    },
    smaller() {
      this.isBig = false;
      this.area.width = 16;
      this.area.height = 16;
    },
    standing() {
      this.stop();
      this.frame = this.isBig
        ? this.bigStopFrame
        : this.isFire
        ? this.fireStopFrame
        : this.smallStopFrame;
    },
    jumping() {
      this.stop();
      this.frame = this.isBig
        ? this.bigJumpFrame
        : this.isFire
        ? this.fireJumpFrame
        : this.smallJumpFrame;
    },
    running() {
      const animation = this.isBig
        ? this.bigAnimation
        : this.isFire
        ? this.fireAnimation
        : this.smallAnimation;
      if (this.curAnim() !== animation) {
        this.play(animation);
      }
    },
    freeze() {
      this.isFrozen = true;
    },
    die() {
      this.unuse("body");
      this.bump();
      this.isAlive = false;
      this.freeze();
      this.use(lifespan(1, { fade: 1 }));
    },
  };
}
