import GAME_CONFIG from "../../data/constants";
import { gameState } from "../../data/GameState";

export default function createSheep(x, y) {
  const config = GAME_CONFIG.PLAYER;
  const FLOOR_HEIGHT = GAME_CONFIG.FLOOR_HEIGHT;

  let jumpCounter = 0;
  let comboTextUI = null; // Renamed to avoid confusion

  // Player (sheep)
  const sheep = add([
    sprite("sheep"),
    pos(x, height() - FLOOR_HEIGHT - 100),
    area(),
    body(),
    health(gameState.player.health),
    "player",
  ]);

  onKeyDown("1", () => {
    go("boss1");
  });

  onKeyDown("right", () => {
    sheep.move(config.SPEED, 0);
  });

  onKeyPress("right", () => {
    sheep.play("walk");
  });

  onKeyRelease("right", () => {
    sheep.play("idle");
  });

  onKeyDown("left", () => {
    sheep.move(-config.SPEED, 0);
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
        sheep.jump(config.JUMP_FORCE);
      }
    }
    if (jumpCounter === 2) {
      sheep.jump(config.SUPER_JUMP_FORCE);
      addKaboom(sheep.pos);
      jumpCounter = 10;
    }
    if (jumpCounter === 10 && sheep.isGrounded()) {
      jumpCounter = 0;
      gameState.resetCombo();

      if (comboTextUI) {
        comboTextUI.text = `COMBO: ${gameState.progress.comboCount}`;
      }

      sheep.jump(0);
    }

    sheep.onGround(() => {
      jumpCounter = 0;
      gameState.resetCombo();
      if (comboTextUI) {
        comboTextUI.text = `COMBO: ${gameState.progress.comboCount}`;
      }
    });

    onKeyDown("down", () => {
      sheep.move(config.SPEED, 200);
    });
  });

  // Helper method to set combo text from main.js
  sheep.setComboText = (textObj) => {
    comboTextUI = textObj;
  };

  return sheep;
}
