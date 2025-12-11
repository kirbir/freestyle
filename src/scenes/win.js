// WIN SCENE
export default function winScene() {
  scene("win", (level) => {
    add([
      text(`LEVEL ${level - 1} COMPLETE!`, { size: 48 }),
      pos(width() / 2, height() / 2 - 50),
      anchor("center"),
      color(255, 215, 0), // Gold
    ]);

    add([
      text("Press SPACE for next level", { size: 24 }),
      pos(width() / 2, height() / 2 + 50),
      anchor("center"),
    ]);

    onKeyPress("space", () => {
      go("game"); // You could pass level number to increase difficulty
    });
  });
}
