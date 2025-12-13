// src/scenes/level1.js
import { gameState } from "../data/GameState";
import GAME_CONFIG from "../data/constants";
import { createJet } from "../entities/enemies/enemyFactory";
import { createHUD } from "../ui/uiFactory";
import { audioManager } from "../managers/audioManager";
import createSheep from "../entities/player/sheep";
import init from "../init";

export function createLevel1Scene() {
  scene("level1", () => {
    // Setup
    setGravity(GAME_CONFIG.GRAVITY);
    const levelConfig = GAME_CONFIG.LEVELS[1];
    const floorHeight = GAME_CONFIG.FLOOR_HEIGHT;

    // Reset state for new level
    gameState.progress.jetKillCount = 0;
    gameState.progress.comboCount = 0;
    gameState.progress.gateOpen = false;

    // Load assets
    loadRoot("./");
    init();
    audioManager.loadAssets();

    // Create entities
    const sheep = createSheep(300, 200);
    const hud = createHUD(gameState);

    // Music handling
    let musicStarted = false;

    function startMusic() {
      if (!musicStarted) {
        musicStarted = true;
        audioManager.playMusic(levelConfig.music);
      }
    }

    onKeyPress(() => startMusic());
    onClick(() => startMusic());

    // Floor
    add([
      pos(0, height() - floorHeight),
      rect(width(), floorHeight),
      opacity(0),
      area(),
      body({ isStatic: true }),
      "floor",
    ]);

    // Gate
    const gate = add([
      rect(40, 150),
      pos(width() - 60, height() - floorHeight - 150),
      color(150, 75, 0),
      area(),
      body({ isStatic: true }),
      "gate",
    ]);

    const gateLabel = add([
      text("LOCKED", { size: 16 }),
      pos(width() - 80, height() - floorHeight - 180),
      color(255, 0, 0),
      fixed(),
      z(100),
    ]);

    // Intro message
    showIntroMessage();

    // Enemy spawning
    const spawnInterval = loop(GAME_CONFIG.ENEMIES.JET.SPAWN_INTERVAL, () => {
      createJet();
    });

    // Collision handling
    sheep.onCollide("jet", (jet) =>
      handleJetCollision(sheep, jet, hud, levelConfig, gateLabel)
    );
  });
}

function showIntroMessage() {
  const introBox = add([
    rect(700, 220),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(0, 0, 0),
    opacity(0.8),
    outline(4, rgb(255, 215, 0)),
    fixed(),
    z(199),
  ]);

  const introMessage = add([
    text(
      "Get a 3 hit kill combo\nor defeat 20 US AIRFORCE Jets total!\n\nRemember to use your DOUBLE JUMP!",
      { size: 32, align: "center" }
    ),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(255, 255, 255),
    outline(4, rgb(0, 0, 0)),
    fixed(),
    z(200),
    opacity(1),
  ]);

  wait(4, () => {
    tween(
      introMessage.opacity,
      0,
      1,
      (val) => (introMessage.opacity = val),
      easings.easeOutQuad
    );
    tween(
      introBox.opacity,
      0,
      1,
      (val) => (introBox.opacity = val),
      easings.easeOutQuad
    );
    wait(1, () => {
      destroy(introMessage);
      destroy(introBox);
    });
  });
}

function handleJetCollision(sheep, jet, hud, levelConfig, gateLabel) {
  const sheepBottom = sheep.pos.y + sheep.height;
  const jetTop = jet.pos.y;
  const isFalling = sheep.vel.y > 0;

  if (isFalling && sheepBottom <= jetTop + 30) {
    // STOMP KILL
    destroy(jet);
    audioManager.playSound("destroy");
    shake(8);
    addKaboom(jet.pos);

    // Update state
    const combo = gameState.incrementCombo();
    const kills = gameState.killJet();
    gameState.addScore(jet.scoreValue * combo); // Combo multiplier!

    // Update UI
    hud.updateCombo(combo);
    hud.updateKillCount(kills, levelConfig.requiredKills);
    hud.updateScore(gameState.player.score);

    // Check win condition
    if (combo >= levelConfig.comboToWin || kills >= levelConfig.requiredKills) {
      if (!gameState.progress.gateOpen) {
        gameState.openGate();
        gateLabel.text = "OPEN!";
        gateLabel.color = rgb(0, 255, 0);
        shake(20);
        wait(1, () => {
          audioManager.stopCurrentMusic();
          go(levelConfig.nextScene);
        });
      }
    }

    sheep.jump(400);
  } else {
    // HIT BY JET
    const died = gameState.damagePlayer(jet.damage);
    hud.updateHealth(gameState.player.health);
    shake(12);
    audioManager.playSound("mee");
    sheep.pos.x -= 50;
    destroy(jet);

    gameState.resetCombo();
    hud.updateCombo(0);

    if (died) {
      go("gameover");
    }
  }
}
