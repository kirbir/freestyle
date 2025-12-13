export default function createMenuScene() {
  scene("menu", () => {
    loadRoot("./");

    const menuItems = add([
      text("PLAY", { size: 32, align: "center" }),
      pos(width() / 2, height() / 2),
      area({ shape: new Polygon([vec2(0), vec2(100), vec2(-100, 100)]) }),
      anchor("center"),
      color(255, 255, 255),
      outline(4, rgb(0, 0, 0)),
      fixed(),
      z(200),
      opacity(1),
      "button1",
    ]);

    onClick("button1", go("level1"));
  });
}
