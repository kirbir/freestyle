// src/state/gameState.js
class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.player = {
      health: 100,
      maxHealth: 100,
      lives: 3,
      score: 0,
    };

    this.progress = {
      currentLevel: 1,
      jetKillCount: 0,
      comboCount: 0,
      gateOpen: false,
      bossesDefeated: [],
      levelsCompleted: [],
    };

    this.audio = {
      musicVolume: 0.2,
      sfxVolume: 0.6,
      currentMusic: null,
      isMuted: false,
    };

    this.settings = {
      difficulty: "normal", // easy, normal, hard
      showFPS: false,
    };

    this.session = {
      startTime: Date.now(),
      deaths: 0,
      totalJetsKilled: 0,
    };
  }

  // Player state methods
  damagePlayer(amount) {
    this.player.health = Math.max(0, this.player.health - amount);
    if (this.player.health <= 0) {
      this.player.lives--;
      this.session.deaths++;
      return true; // Player died
    }
    return false;
  }

  healPlayer(amount) {
    this.player.health = Math.min(
      this.player.maxHealth,
      this.player.health + amount
    );
  }

  addScore(points) {
    this.player.score += points;
  }

  // Progress methods
  incrementCombo() {
    this.progress.comboCount++;
    return this.progress.comboCount;
  }

  resetCombo() {
    this.progress.comboCount = 0;
  }

  killJet() {
    this.progress.jetKillCount++;
    this.session.totalJetsKilled++;
    return this.progress.jetKillCount;
  }

  completeLevel(levelNumber) {
    if (!this.progress.levelsCompleted.includes(levelNumber)) {
      this.progress.levelsCompleted.push(levelNumber);
    }
    this.progress.currentLevel++;
  }

  defeatBoss(bossName) {
    if (!this.progress.bossesDefeated.includes(bossName)) {
      this.progress.bossesDefeated.push(bossName);
    }
  }

  openGate() {
    this.progress.gateOpen = true;
  }

  // Audio methods
  setMusicVolume(volume) {
    this.audio.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.audio.currentMusic) {
      this.audio.currentMusic.volume = this.audio.musicVolume;
    }
  }

  setSfxVolume(volume) {
    this.audio.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setCurrentMusic(musicObject) {
    if (this.audio.currentMusic) {
      this.audio.currentMusic.paused = true;
    }
    this.audio.currentMusic = musicObject;
  }

  stopMusic() {
    if (this.audio.currentMusic) {
      this.audio.currentMusic.paused = true;
      this.audio.currentMusic = null;
    }
  }

  // Persistence
  save() {
    const saveData = {
      player: this.player,
      progress: this.progress,
      settings: this.settings,
      session: this.session,
    };
    setData("savedGame", JSON.stringify(saveData));
    console.log("Game saved!");
  }

  load() {
    const saved = getData("savedGame");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.player = data.player || this.player;
        this.progress = data.progress || this.progress;
        this.settings = data.settings || this.settings;
        this.session = data.session || this.session;
        console.log("Game loaded!");
        return true;
      } catch (e) {
        console.error("Failed to load save:", e);
        return false;
      }
    }
    return false;
  }

  // Debug info
  getDebugInfo() {
    return {
      Level: this.progress.currentLevel,
      Health: `${this.player.health}/${this.player.maxHealth}`,
      Lives: this.player.lives,
      Score: this.player.score,
      Combo: this.progress.comboCount,
      "Jets Killed": this.progress.jetKillCount,
      "Session Time": `${Math.floor(
        (Date.now() - this.session.startTime) / 1000
      )}s`,
    };
  }
}

export const gameState = new GameState();

// Make it globally accessible for debugging
if (typeof window !== "undefined") {
  window.gameState = gameState;
}
