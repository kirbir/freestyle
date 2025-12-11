// src/managers/audioManager.js
import { gameState } from "../data/gameState";

export class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = {};
  }

  loadAssets() {
    // Load sounds
    loadSound("destroy", "/sounds/destroy.wav");
    loadSound("bang", "/sounds/gun.wav");
    loadSound("mee", "/sounds/mee.wav");

    // Load music
    loadMusic("themesong", "/music/game.mp3");
    loadMusic("boss1", "/music/bossfight.mp3");
    loadMusic("scream1", "/sounds/scream1.wav");
    loadMusic("scream2", "/sounds/scream2.wav");
  }

  playSound(soundName) {
    if (!gameState.audio.isMuted) {
      play(soundName, { volume: gameState.audio.sfxVolume });
    }
  }

  playMusic(musicName, options = {}) {
    const defaultOptions = {
      volume: gameState.audio.musicVolume,
      loop: true,
      ...options,
    };

    gameState.stopMusic();
    const musicObj = play(musicName, defaultOptions);
    gameState.setCurrentMusic(musicObj);

    return musicObj;
  }

  stopCurrentMusic() {
    gameState.stopMusic();
  }

  toggleMute() {
    gameState.audio.isMuted = !gameState.audio.isMuted;
    if (gameState.audio.isMuted && gameState.audio.currentMusic) {
      gameState.audio.currentMusic.paused = true;
    } else if (gameState.audio.currentMusic) {
      gameState.audio.currentMusic.paused = false;
    }
  }
}

export const audioManager = new AudioManager();
