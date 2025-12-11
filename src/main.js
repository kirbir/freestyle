// src/main.js
import kaplay from "kaplay";
import "kaplay/global";
import GAME_CONFIG from "./data/constants";
import { createLevel1Scene } from "./scenes/level1";
import createBoss1 from "./scenes/boss1";
import winScene from "./scenes/win";
import gameOver from "./scenes/gameOver";
import { gameState } from "./data/gameState";

// Initialize Kaplay
kaplay({
  background: [0, 0, 0],
  width: GAME_CONFIG.SCREEN_WIDTH,
  height: GAME_CONFIG.SCREEN_HEIGHT,
  stretch: true,
  letterbox: false,
});

// Register all scenes
createLevel1Scene();
createBoss1();
winScene();
gameOver();

// Start the game
go("level1");

// Debug commands (press tilde ~ key)
onKeyPress("grave", () => {
  console.log(gameState.getDebugInfo());
});
