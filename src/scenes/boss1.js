// BOSS CHARACTER

import init from "../init";
import GAME_CONFIG from "../data/constants";
import createSheep from "../entities/player/sheep";
import { gameState } from "../data/GameState";
import { audioManager } from "../managers/audioManager";

export default function createBoss1() {
  // BOSS FIGHT SCENE
  scene("boss1", () => {
    setGravity(GAME_CONFIG.GRAVITY);
    let screams = ["scream1", "scream2"];

    init();
    audioManager.loadAssets();

    const sheep = createSheep(200, height() - GAME_CONFIG.FLOOR_HEIGHT - 100);
    sheep.hp(gameState.player.health);

    const music = play("boss1", {
      volume: 0.2,
      loop: true,
    });

    const boss = add([
      sprite("boss"),
      pos(width() - 200, height() - GAME_CONFIG.FLOOR_HEIGHT - 150),
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
      boss.move(0, boss.moveDirection * 200);

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

        const bossGunX = boss.pos.x;
        const bossGunY = boss.pos.y + boss.height / 2;

        const particle = add([
          rect(rand(4, 8), rand(4, 8)),
          pos(bossGunX, bossGunY),
          color(rand(100, 255), 0, 0),
          opacity(rand(0.7, 1)),
          lifespan(rand(0.3, 2.6)),
          move(LEFT, rand(50, 100)),
          scale(5),
          z(boss.z - 1),
        ]);

        particle.onUpdate(() => {
          particle.opacity -= dt() * 2;
          particle.scaleTo(particle.scale.x - dt() * -1.5);
        });

        wait(0.2, () => {
          if (boss.exists()) {
            boss.play("idle");
          }
        });
      }
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
      pos(0, height() - GAME_CONFIG.FLOOR_HEIGHT),
      rect(width(), GAME_CONFIG.FLOOR_HEIGHT),
      opacity(0),
      area(),
      body({ isStatic: true }),
      "floor",
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
      rect((gameState.player.health / gameState.player.maxHealth) * 200, 20),
      pos(20, 20),
      color(0, 200, 0),
      fixed(),
      z(101),
    ]);

    const healthText = add([
      text(`${gameState.player.health}/${gameState.player.maxHealth}`, {
        size: 16,
      }),
      pos(30, 22),
      color(255, 255, 255),
      outline(3, rgb(0, 0, 0)),
      fixed(),
      z(102),
    ]);

    // Sheep vs Boss collision (stomp)
    sheep.onCollide("boss", (b) => {
      const sheepBottom = sheep.pos.y + sheep.height;
      const bossBottom = boss.pos.y + boss.height;

      const bossTop = b.pos.y;
      const isFalling = sheep.vel.y > 0;

      // BOSS STOMPS THE SHEEP
      if (bossBottom <= sheep.pos.y + 50) {
        audioManager.playSound("mee");
        shake(8);
        addKaboom(sheep.pos);
        sheep.pos.x -= 50;
        sheep.hurt(20);
        healthBar.width = (sheep.hp() / 100) * 200;
        healthText.text = `${sheep.hp()}/100`;
        shake(10);

        sheep.jump(600);

        tween(
          sheep.pos.x,
          sheep.pos.x - 500,
          0.2,
          (val) => (sheep.pos.x = val),
          easings.easeOutQuad
        );

        sheep.use(
          shader("redGlow", () => ({
            u_time: time(),
          }))
        );

        wait(2, () => {
          if (sheep.exists) {
            sheep.unuse("shader");
          }
        });

        if (sheep.hp() <= 0) {
          // Stop boss music when player dies
          music.paused = true;
          go("gameover");
        }
      }

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
      gameState.damagePlayer(20);
      sheep.setHP(gameState.player.health);
      sheep.hurt(20);
      healthBar.width = (sheep.hp() / 100) * 200;
      healthText.text = `${sheep.hp()}/100`;
      shake(10);

      sheep.use(
        shader("redGlow", () => ({
          u_time: time(),
        }))
      );

      audioManager.playSound("mee");

      wait(2, () => {
        if (sheep.exists()) {
          sheep.unuse("shader");
        }
      });

      if (sheep.hp() <= 0) {
        // Stop boss music when player dies
        audioManager.stopCurrentMusic();
        go("gameover");
      }
    });

    // Player controls
    // sheep.onGround(() => {
    //   jumpCounter = 0;
    // });

    // onKeyDown("right", () => {
    //   sheep.move(SPEED, 0);
    // });

    // onKeyPress("right", () => {
    //   sheep.play("walk");
    // });

    // onKeyRelease("right", () => {
    //   sheep.play("idle");
    // });

    // onKeyDown("left", () => {
    //   sheep.move(-SPEED, 0);
    // });

    // onKeyPress("left", () => {
    //   sheep.play("walk");
    // });

    // onKeyRelease("left", () => {
    //   sheep.play("idle");
    // });

    // onKeyPress("up", () => {
    //   if (sheep.isFalling() || sheep.isGrounded()) {
    //     if (jumpCounter !== 10) {
    //       jumpCounter++;
    //       sheep.jump(JUMP_FORCE);
    //     }
    //   }
    //   if (jumpCounter === 2) {
    //     sheep.jump(SUPER_JUMP_FORCE);
    //     addKaboom(sheep.pos);
    //     jumpCounter = 10;
    //   }
    //   if (jumpCounter === 10 && sheep.isGrounded()) {
    //     jumpCounter = 0;
    //     sheep.jump(0);
    //   }
    // });
  });
}
