// src/ui/uiFactory.js

export function createHealthBar(x, y, width, height, options = {}) {
  const {
    maxValue = 100,
    currentValue = 100,
    bgColor = rgb(100, 100, 100),
    fgColor = rgb(0, 200, 0),
    showText = true,
    label = "",
    isFixed = true,
  } = options;

  const bg = add([
    rect(width, height),
    pos(x, y),
    color(bgColor),
    ...(isFixed ? [fixed()] : []),
    z(100),
    "ui",
    "healthbar-bg",
  ]);

  const fg = add([
    rect(width, height),
    pos(x, y),
    color(fgColor),
    ...(isFixed ? [fixed()] : []),
    z(101),
    "ui",
    "healthbar-fg",
    {
      maxWidth: width,
      maxValue: maxValue,
    },
  ]);

  let textObj = null;
  if (showText) {
    textObj = add([
      text(`${label}${currentValue}/${maxValue}`, { size: 16 }),
      pos(x + 10, y + 2),
      color(255, 255, 255),
      outline(3, rgb(0, 0, 0)),
      ...(isFixed ? [fixed()] : []),
      z(102),
      "ui",
      "healthbar-text",
    ]);
  }

  // Update method
  const updateHealthBar = (value, max = maxValue) => {
    const percentage = value / max;
    fg.width = fg.maxWidth * percentage;
    if (textObj) {
      textObj.text = `${label}${Math.max(0, value)}/${max}`;
    }
  };

  return {
    bg,
    fg,
    text: textObj,
    update: updateHealthBar,
    destroy: () => {
      destroy(bg);
      destroy(fg);
      if (textObj) destroy(textObj);
    },
  };
}

export function createHUD(gameState) {
  const screenWidth = width();
  const screenHeight = height();

  // Player health bar
  const playerHealthBar = createHealthBar(20, 20, 200, 20, {
    fgColor: rgb(0, 200, 0),
    label: "",
    currentValue: gameState.player.health,
    maxValue: gameState.player.maxHealth,
  });

  // Combo counter
  const comboText = add([
    text("COMBO: 0", { size: 24 }),
    pos(screenWidth / 2, 60),
    anchor("center"),
    fixed(),
    z(100),
    color(255, 255, 0),
    outline(4, rgb(0, 0, 0)),
    "ui",
  ]);

  // Score display
  const scoreText = add([
    text("SCORE: 0", { size: 20 }),
    pos(screenWidth / 2, 90),
    anchor("center"),
    fixed(),
    z(100),
    color(255, 215, 0),
    outline(3, rgb(0, 0, 0)),
    "ui",
  ]);

  // Kill counter
  const killCountText = add([
    text("JETS LEFT: 20", { size: 20 }),
    pos(screenWidth - 20, 20),
    anchor("topright"),
    color(255, 100, 100),
    outline(3, rgb(0, 0, 0)),
    fixed(),
    z(100),
    "ui",
  ]);

  // Game title
  const gameTitle = add([
    text("Revenge of the SHIBA\nBy Birkir Reyniss", {
      size: 18,
      align: "left",
    }),
    pos(20, screenHeight - 60),
    color(255, 215, 0),
    outline(3, rgb(0, 0, 0)),
    fixed(),
    z(100),
    "ui",
  ]);

  return {
    playerHealthBar,
    comboText,
    scoreText,
    killCountText,
    gameTitle,
    updateHealth: (value) =>
      playerHealthBar.update(value, gameState.player.maxHealth),
    updateCombo: (value) => {
      comboText.text = `COMBO: ${value}`;
    },
    updateScore: (value) => {
      scoreText.text = `SCORE: ${value}`;
    },
    updateKillCount: (current, total) => {
      killCountText.text = `JETS LEFT: ${total - current}`;
    },
    destroyAll: () => {
      playerHealthBar.destroy();
      destroy(comboText);
      destroy(scoreText);
      destroy(killCountText);
      destroy(gameTitle);
    },
  };
}
