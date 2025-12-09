import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the k. prefix
import init from "./init";

kaplay({
  background: [0, 0, 0],
  width: 1280, // Fixed virtual width
  height: 720, // Fixed virtual height
  stretch: true, // Stretch to fit screen (or use letterbox: true for black bars)
  letterbox: false, // Set to true if you want black bars instead of stretching
});

const FLOOR_HEIGHT = 48;
const JUMP_FORCE = 800;
const SUPER_JUMP_FORCE = 1200;
const SPEED = 480;

let particleEmitter = null;
let jumpCounter = 0;
let comboCount = 0;
let screams = ["scream1", "scream2"];

onUpdate(() => {});

scene("game", () => {
  // define gravity
  setGravity(1600);

  let gateOpen = false; // Track if boss fight has been triggered
  let gameMusic = null; // Store music reference
  let jetKillCount = 0; // Track total jet kills

  loadRoot("./"); // A good idea for Itch.io publishing later

  loadSound("destroy", "/sounds/destroy.wav");
  loadSound("bang", "/sounds/gun.wav");
  loadSound("mee", "/sounds/mee.wav");

  // Load and play music after it's ready
  loadMusic("themesong", "/music/game.mp3");
  loadMusic("boss1", "/music/bossfight.mp3");
  loadMusic("scream1", "/sounds/scream1.wav");
  loadMusic("scream2", "/sounds/scream2.wav");

  init();

  // Play music after a short delay to ensure it's loaded
  wait(0.1, () => {
    gameMusic = play("themesong", {
      volume: 0.2,
      loop: true,
    });
    // Store music reference globally so we can pause it later
    setData("gameMusic", gameMusic);
  });

  // Health bar background (gray/red background)
  const healthBarBg = add([
    rect(200, 20),
    pos(width() / 2 - 100, 20),
    color(100, 100, 100), // Gray background
    fixed(), // Stays on screen (UI element)
    z(100), // On top of everything
  ]);
  // Health bar foreground (green bar that shrinks)
  const healthBar = add([
    rect(200, 20),
    pos(width() / 2 - 100, 20),
    color(0, 200, 0), // Green
    fixed(),
    z(101),
  ]);

  // Optional: Health text label
  const healthText = add([
    text("100/100", { size: 16 }),
    pos(width() / 2 - 90, 22),
    color(255, 255, 255),
    outline(3, rgb(0, 0, 0)),
    fixed(),
    z(102),
  ]);

  // Combo display
  const comboText = add([
    text("COMBO: 0", { size: 24 }),
    pos(width() / 2, 60),
    anchor("center"),
    fixed(),
    z(100),
    color(255, 255, 0), // Yellow
    outline(4, rgb(0, 0, 0)),
  ]);

  // Game title (top left)
  const gameTitle = add([
    text("Revenge of the SHIBA\nBy Birkir Reyniss", {
      size: 18,
      align: "left",
    }),
    pos(20, 20),
    color(255, 215, 0), // Gold
    outline(3, rgb(0, 0, 0)),
    fixed(),
    z(100),
  ]);

  // Kill counter (top right)
  const killCountText = add([
    text("JETS LEFT: 20", { size: 20 }),
    pos(width() - 20, 20),
    anchor("topright"),
    color(255, 100, 100), // Red
    outline(3, rgb(0, 0, 0)),
    fixed(),
    z(100),
  ]);

  // The gate on the right side
  const gate = add([
    rect(40, 150),
    pos(width() - 60, height() - FLOOR_HEIGHT - 150),
    color(150, 75, 0), // Brown/closed
    area(),
    body({ isStatic: true }),
    "gate",
  ]);

  // Gate label
  const gateLabel = add([
    text("LOCKED", { size: 16 }),
    pos(width() - 80, height() - FLOOR_HEIGHT - 180),
    color(255, 0, 0),
    fixed(),
    z(100),
  ]);

  // Add invisible FLOOR for physics/gravity
  add([
    pos(0, height() - FLOOR_HEIGHT),
    rect(width(), FLOOR_HEIGHT),
    opacity(0), // Green color (or use opacity(0) to make invisible)
    area(),
    body({ isStatic: true }),
    "floor",
  ]);

  const sheep = add([
    sprite("sheep"), // Changed from "sheep1" to "sheep"
    pos(400, -600),
    area(),
    body(),
    health(100),
  ]);

  // Intro message background box
  const introBox = add([
    rect(700, 220), // Width and height of the box
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(0, 0, 0), // Black background
    opacity(0.8), // Semi-transparent
    outline(4, rgb(255, 215, 0)), // Gold border
    fixed(),
    z(199), // Just behind the text
  ]);

  // Intro message text
  const introMessage = add([
    text(
      "Get a 3 hit kill combo\nor defeat 20 US AIRFORCE Jets total!\n\nRemember to use your DOUBLE JUMP! SUper-jump on top of them!!!!",
      {
        size: 32,
        align: "center",
      }
    ),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(255, 255, 255),
    outline(4, rgb(0, 0, 0)),
    fixed(),
    z(200), // On top of the box
    opacity(1),
  ]);

  // Fade out both after 4 seconds
  wait(4, () => {
    // Fade out text
    tween(
      introMessage.opacity,
      0,
      1,
      (val) => (introMessage.opacity = val),
      easings.easeOutQuad
    );

    // Fade out box
    tween(
      introBox.opacity,
      0,
      1,
      (val) => (introBox.opacity = val),
      easings.easeOutQuad
    );

    // Destroy both after fade completes
    wait(1, () => {
      destroy(introMessage);
      destroy(introBox);
    });
  });

  function spawnJet() {
    const jet = add([
      sprite("jet"),
      pos(width() + 50, rand(150, 520)), // Spawns at reachable heights (150-520 on 720p screen)
      area(),
      move(LEFT, rand(150, 600)), // Flies LEFT at random speed
      offscreen({ destroy: true }), // Auto-destroys when it exits left side
      "enemy",
      "jet",
      shader("invert", () => ({
        u_time: time(),
      })),
    ]);

    // Add exhaust particle effect
    jet.onUpdate(() => {
      // Spawn particles from the right side of the jet (exhaust)
      if (rand(0, 1) < 0.6) {
        // 60% chance each frame for more particles
        const exhaustX = jet.pos.x + jet.width; // Right side of jet
        const exhaustY = jet.pos.y + 20; // Slightly randomized Y

        const particle = add([
          rect(rand(4, 8), rand(4, 8)), // Random small square
          pos(exhaustX, exhaustY),
          color(rand(150, 255), rand(100, 150), rand(0, 50)), // Orange/red/yellow
          opacity(rand(0.7, 1)),
          lifespan(rand(0.3, 0.6)), // Particles live for 0.3-0.6 seconds
          move(RIGHT, rand(50, 100)), // Move right (opposite to jet direction)
          scale(1),
          z(jet.z - 1), // Behind the jet
        ]);

        // Fade out and shrink the particle over time
        particle.onUpdate(() => {
          particle.opacity -= dt() * 2; // Fade out
          particle.scaleTo(particle.scale.x - dt() * 1.5); // Shrink
        });
      }
    });
  }

  let jetsSpawned = 0;

  const spawnInterval = loop(1.5, () => {
    // if (jetsSpawned < 10) {
    spawnJet();
    jetsSpawned++;
    // } else {
    //     spawnInterval.cancel();
    // }
  });

  sheep.onCollide("jet", (jet) => {
    // Check if sheep is falling AND is above the jet (stomping)
    const sheepBottom = sheep.pos.y + sheep.height;
    const jetTop = jet.pos.y;
    const isFalling = sheep.vel.y > 0; // Moving downward

    // If sheep is coming from above and falling = STOMP!
    if (isFalling && sheepBottom <= jetTop + 30) {
      // Destroy the jet
      destroy(jet);
      play("destroy");
      shake(8);
      addKaboom(jet.pos);
      comboCount++;
      jetKillCount++;
      comboText.text = `COMBO: ${comboCount}`;
      killCountText.text = `JETS LEFT: ${20 - jetKillCount}`;

      // Check if combo reached 3 OR killed 20 jets - GO TO BOSS FIGHT!
      if ((comboCount >= 3 || jetKillCount >= 20) && !gateOpen) {
        gateOpen = true;
        shake(20);
        wait(1, () => {
          // Pause the main game music
          if (gameMusic) {
            gameMusic.paused = true;
          }
          go("boss"); // Start boss fight
        });
      }

      // Give a little bounce after stomp
      sheep.jump(400);
    } else {
      // Jet hit sheep from front = DAMAGE!
      sheep.hurt(25); // 25% of 100 health
      healthBar.width = (sheep.hp() / 100) * 200;
      healthText.text = `${sheep.hp()}/100`;
      shake(12);
      play("mee");

      // Optional: knockback the sheep
      sheep.pos.x -= 50;

      // Destroy the jet after hitting (or keep it if you want it to fly through)
      destroy(jet);

      comboCount = 0;
      comboText.text = `COMBO: ${comboCount}`;

      // Check for game over
      if (sheep.hp() <= 0) {
        go("gameover"); // Create this scene or use go("game") to restart
      }
    }
  });

  sheep.onGround(() => {
    jumpCounter = 0;
    comboCount = 0;
    comboText.text = `COMBO: ${comboCount}`;
  });

  onKeyDown("right", () => {
    sheep.move(SPEED, 0);
  });

  onKeyPress("right", () => {
    sheep.play("walk");
  });

  onKeyRelease("right", () => {
    sheep.play("idle");
  });

  onKeyDown("left", () => {
    sheep.move(-SPEED, 0);
  });

  onKeyPress("left", () => {
    sheep.play("walk");
  });

  onKeyRelease("left", () => {
    sheep.play("idle");
  });

  onKeyPress("up", () => {
    if (sheep.isFalling() || sheep.isGrounded()) {
      if (jumpCounter !== 10) {
        jumpCounter++;
        sheep.jump(JUMP_FORCE);
      }
    }
    if (jumpCounter === 2) {
      sheep.jump(SUPER_JUMP_FORCE);
      addKaboom(sheep.pos);
      jumpCounter = 10;
    }
    if (jumpCounter === 10 && sheep.isGrounded()) {
      jumpCounter = 0;
      comboCount = 0;
      comboText.text = `COMBO: ${comboCount}`;
      sheep.jump(0);
    }
  });

  onKeyDown("down", () => {
    sheep.move(SPEED, 200);
  });
});

// BOSS FIGHT SCENE
scene("boss", () => {
  setGravity(1600);

  init();

  const music = play("boss1", {
    volume: 0.2,
    loop: true,
  });

  // Boss health bar background
  const bossHealthBg = add([
    rect(400, 30),
    pos(width() / 2 - 200, 20),
    color(100, 100, 100),
    fixed(),
    z(100),
  ]);

  // Boss health bar foreground
  const bossHealthBar = add([
    rect(400, 30),
    pos(width() / 2 - 200, 20),
    color(200, 0, 0),
    fixed(),
    z(101),
  ]);

  // Boss health text
  const bossHealthText = add([
    text("BOSS: 300/300", { size: 20 }),
    pos(width() / 2, 36),
    anchor("center"),
    color(255, 255, 255),
    outline(3, rgb(0, 0, 0)),
    fixed(),
    z(102),
  ]);

  // Floor
  add([
    pos(0, height() - FLOOR_HEIGHT),
    rect(width(), FLOOR_HEIGHT),
    opacity(0),
    area(),
    body({ isStatic: true }),
    "floor",
  ]);

  // Player (sheep)
  const sheep = add([
    sprite("sheep"),
    pos(200, height() - FLOOR_HEIGHT - 100),
    area(),
    body(),
    health(100),
    "player",
  ]);

  // Player health bar
  const healthBarBg = add([
    rect(200, 20),
    pos(20, 20),
    color(100, 100, 100),
    fixed(),
    z(100),
  ]);

  const healthBar = add([
    rect(200, 20),
    pos(20, 20),
    color(0, 200, 0),
    fixed(),
    z(101),
  ]);

  const healthText = add([
    text("100/100", { size: 16 }),
    pos(30, 22),
    color(255, 255, 255),
    outline(3, rgb(0, 0, 0)),
    fixed(),
    z(102),
  ]);

  // BOSS CHARACTER
  const boss = add([
    sprite("boss"),
    pos(width() - 200, height() - FLOOR_HEIGHT - 150),
    area(),
    health(300),
    "boss",
    {
      shootTimer: 0,
      moveTimer: 0,
      moveDirection: -1,
    },
  ]);

  boss.play("idle");

  // Boss AI
  boss.onUpdate(() => {
    // Move boss up and down
    boss.moveTimer += dt();
    if (boss.moveTimer > 2) {
      boss.moveTimer = 0;
      boss.moveDirection *= -1;
    }
    boss.move(0, boss.moveDirection * 100);

    // Shoot projectiles
    boss.shootTimer += dt();
    if (boss.shootTimer > 1.5) {
      boss.shootTimer = 0;
      boss.play("shoot");

      // Spawn bullet
      play("bang"); // Play gun sound

      const bullet = add([
        rect(20, 8),
        pos(boss.pos.x - 40, boss.pos.y + boss.height / 2),
        area(),
        move(LEFT, 400),
        color(255, 255, 0),
        offscreen({ destroy: true }),
        "bullet",
      ]);

      wait(0.2, () => {
        if (boss.exists()) {
          boss.play("idle");
        }
      });
    }
  });

  // Sheep vs Boss collision (stomp)
  sheep.onCollide("boss", (b) => {
    const sheepBottom = sheep.pos.y + sheep.height;
    const bossTop = b.pos.y;
    const isFalling = sheep.vel.y > 0;

    if (isFalling && sheepBottom <= bossTop + 50) {
      // STOMP DAMAGE!
      b.hurt(50);
      bossHealthBar.width = (b.hp() / 300) * 400;
      bossHealthText.text = `BOSS: ${b.hp()}/300`;
      shake(15);

      // Flash red for 2 seconds when hit
      b.use(
        shader("redGlow", () => ({
          u_time: time(),
        }))
      );

      play(choose(screams));

      wait(2, () => {
        if (b.exists()) {
          b.unuse("shader");
        }
      });

      addKaboom(b.pos);
      sheep.jump(600);

      tween(
        sheep.pos.x,
        sheep.pos.x - 500,
        0.2,
        (val) => (sheep.pos.x = val),
        easings.easeOutQuad
      );

      if (b.hp() <= 0) {
        destroy(b);
        wait(1, () => {
          // Stop boss music when defeated
          music.paused = true;
          go("win", 2);
        });
      }
    }
  });

  // Sheep vs Bullet collision
  sheep.onCollide("bullet", (bullet) => {
    destroy(bullet);
    sheep.hurt(20);
    healthBar.width = (sheep.hp() / 100) * 200;
    healthText.text = `${sheep.hp()}/100`;
    shake(10);

    if (sheep.hp() <= 0) {
      // Stop boss music when player dies
      music.paused = true;
      go("gameover");
    }
  });

  // Player controls
  sheep.onGround(() => {
    jumpCounter = 0;
  });

  onKeyDown("right", () => {
    sheep.move(SPEED, 0);
  });

  onKeyPress("right", () => {
    sheep.play("walk");
  });

  onKeyRelease("right", () => {
    sheep.play("idle");
  });

  onKeyDown("left", () => {
    sheep.move(-SPEED, 0);
  });

  onKeyPress("left", () => {
    sheep.play("walk");
  });

  onKeyRelease("left", () => {
    sheep.play("idle");
  });

  onKeyPress("up", () => {
    if (sheep.isFalling() || sheep.isGrounded()) {
      if (jumpCounter !== 10) {
        jumpCounter++;
        sheep.jump(JUMP_FORCE);
      }
    }
    if (jumpCounter === 2) {
      sheep.jump(SUPER_JUMP_FORCE);
      addKaboom(sheep.pos);
      jumpCounter = 10;
    }
    if (jumpCounter === 10 && sheep.isGrounded()) {
      jumpCounter = 0;
      sheep.jump(0);
    }
  });
});

// WIN SCENE
scene("win", (level) => {
  add([
    text(`LEVEL ${level - 1} COMPLETE!`, { size: 48 }),
    pos(width() / 2, height() / 2 - 50),
    anchor("center"),
    color(255, 215, 0), // Gold
  ]);

  add([
    text("Press SPACE for next level", { size: 24 }),
    pos(width() / 2, height() / 2 + 50),
    anchor("center"),
  ]);

  onKeyPress("space", () => {
    go("game"); // You could pass level number to increase difficulty
  });
});

// GAME OVER SCENE
scene("gameover", () => {
  add([
    text("GAME OVER", { size: 64 }),
    pos(width() / 2, height() / 2 - 80),
    anchor("center"),
    color(255, 0, 0),
  ]);

  add([
    text("Press SPACE to restart", { size: 24 }),
    pos(width() / 2, height() / 2 + 40),
    anchor("center"),
  ]);

  onKeyPress("space", () => {
    go("game");
  });
});

go("game");
