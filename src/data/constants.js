const GAME_CONFIG = {
  // Screen
  SCREEN_WIDTH: 1280,
  SCREEN_HEIGHT: 720,

  // Physics
  GRAVITY: 1600,
  FLOOR_HEIGHT: 48,

  // Player
  PLAYER: {
    SPEED: 480,
    JUMP_FORCE: 800,
    SUPER_JUMP_FORCE: 1200,
    MAX_HEALTH: 100,
    STARTING_LIVES: 3,
  },

  // Enemies
  ENEMIES: {
    JET: {
      MIN_SPEED: 150,
      MAX_SPEED: 600,
      MIN_SPAWN_HEIGHT: 150,
      MAX_SPAWN_HEIGHT: 520,
      SPAWN_INTERVAL: 1.5,
      DAMAGE: 25,
      SCORE: 100,
    },
    BOSS_CUSTER: {
      HEALTH: 300,
      SHOOT_INTERVAL: 1.5,
      MOVE_SPEED: 100,
      BULLET_SPEED: 400,
      BULLET_DAMAGE: 20,
      SCORE: 5000,
    },
  },

  // Level progression
  LEVELS: {
    1: {
      name: "Jet Mayhem",
      requiredKills: 20,
      comboToWin: 3,
      nextScene: "boss1",
      music: "themesong",
    },
    2: {
      name: "Level 2",
      requiredKills: 30,
      comboToWin: 5,
      nextScene: "boss2",
      music: "themesong",
    },
  },

  // Audio
  AUDIO: {
    DEFAULT_MUSIC_VOLUME: 0.2,
    DEFAULT_SFX_VOLUME: 0.6,
  },
};

export default GAME_CONFIG;
