// GAME OVER SCENE
export default function gameOverScene() {
  scene("gameover", () => {
    add([
      text("GAME OVER", { size: 64 }),
      pos(width() / 2, height() / 2 - 80),
      anchor("center"),
      color(255, 0, 0),
    ]);

    add([
      text("Press SPACE to restart", { size: 24 }),
      pos(width() / 2, height() / 2 + 40),
      anchor("center"),
    ]);

    onKeyPress("space", () => {
      go("game");
    });
  });
}
