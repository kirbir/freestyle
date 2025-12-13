import { gameState } from "../data/GameState";
import GAME_CONFIG from "../data/constants";
import { createJet } from "../entities/enemies/enemyFactory";
import { createHUD } from "../ui/uiFactory";
import { audioManager } from "../managers/audioManager";
import createSheep from "../entities/player/sheep";
import init from "../init";

export function createLevel2Scene() {
  setGravity(GAME_CONFIG.GRAVITY);
  const floorHeight = GAME_CONFIG.floorHeight;
}
