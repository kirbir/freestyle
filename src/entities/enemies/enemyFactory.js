// src/entities/enemies/enemyFactory.js
import GAME_CONFIG from "../../data/constants";

export function createJet() {
  const config = GAME_CONFIG.ENEMIES.JET;

  const jet = add([
    sprite("jet"),
    pos(width() + 50, rand(config.MIN_SPAWN_HEIGHT, config.MAX_SPAWN_HEIGHT)),
    area(),
    move(LEFT, rand(config.MIN_SPEED, config.MAX_SPEED)),
    offscreen({ destroy: true }),
    "enemy",
    "jet",
    {
      damage: config.DAMAGE,
      scoreValue: config.SCORE,
    },
    shader("invert", () => ({
      u_time: time(),
    })),
  ]);

  // Exhaust particles
  jet.onUpdate(() => {
    if (rand(0, 1) < 0.6) {
      const exhaustX = jet.pos.x + jet.width;
      const exhaustY = jet.pos.y + 20;

      const particle = add([
        rect(rand(4, 8), rand(4, 8)),
        pos(exhaustX, exhaustY),
        color(rand(150, 255), rand(100, 150), rand(0, 50)),
        opacity(rand(0.7, 1)),
        lifespan(rand(0.3, 0.6)),
        move(RIGHT, rand(50, 100)),
        scale(1),
        z(jet.z - 1),
      ]);

      particle.onUpdate(() => {
        particle.opacity -= dt() * 2;
        particle.scaleTo(particle.scale.x - dt() * 1.5);
      });
    }
  });

  return jet;
}

export function createBoss(bossType = "custer") {
  const config = GAME_CONFIG.ENEMIES.BOSS_CUSTER;
  const floorHeight = GAME_CONFIG.FLOOR_HEIGHT;

  const boss = add([
    sprite("boss"),
    pos(width() - 200, height() - floorHeight - 150),
    area(),
    health(config.HEALTH),
    "boss",
    {
      type: bossType,
      shootTimer: 0,
      moveTimer: 0,
      moveDirection: -1,
      shootInterval: config.SHOOT_INTERVAL,
      moveSpeed: config.MOVE_SPEED,
      bulletSpeed: config.BULLET_SPEED,
      bulletDamage: config.BULLET_DAMAGE,
      scoreValue: config.SCORE,
    },
  ]);

  boss.play("idle");
  return boss;
}

export function createBossBullet(boss) {
  const bullet = add([
    rect(20, 8),
    pos(boss.pos.x - 40, boss.pos.y + boss.height / 2),
    area(),
    move(LEFT, boss.bulletSpeed || 400),
    color(255, 255, 0),
    offscreen({ destroy: true }),
    "bullet",
    {
      damage: boss.bulletDamage || 20,
    },
  ]);

  return bullet;
}
