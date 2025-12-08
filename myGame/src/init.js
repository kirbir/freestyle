
export default function init() {

loadSprite("sheep", [
    "./sprites/sheep1.png",
    "./sprites/sheep2.png"
], {
    anims: {
        idle: { from: 0, to: 0 },
        walk: { from: 0, to: 1, loop: true, speed: 8 },
    }
});

loadSprite("hill1", "./sprites/hills.png");
loadSprite("sky1", "./sprites/sky.png");
loadSprite("jet", "./sprites/jet.png");
loadSprite("bean", "./sprites/bean.png").then((data) => {
    let loadedSpriteData = getSprite("bean").data;
    
    // Hill as BACKGROUND only (no area/body)
    add([
        sprite("hill1"),
        pos(0, height()),
        anchor("botleft"),
        scale(width() / 900, 1),
        z(-1),  // Put behind other objects
    
    ]);

    add([
        sprite("sky1"),
        pos(0, 0),
        anchor("topleft"),
        scale(width() / 900, 1),
        z(-2),  // Put behind other objects
    
    ]);

// Health bar background (gray/red background)
const healthBarBg = add([
    rect(200, 20),
    pos(width() / 2 - 100, 20),
    color(100, 100, 100),  // Gray background
    fixed(),               // Stays on screen (UI element)
    z(100),                // On top of everything
]);

// Health bar foreground (green bar that shrinks)
const healthBar = add([
    rect(200, 20),
    pos(width() / 2 - 100, 20),
    color(0, 200, 0),      // Green
    fixed(),
    z(101),
]);

// Optional: Health text label
const healthText = add([
    text("100/100", { size: 16 }),
    pos(width() / 2 -90 , 22),
    color(255, 255, 255),
    fixed(),
    z(102),
]);

    loadShader(
        "invert",
        null,
        `
        uniform float u_time;
        
        vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
            vec4 c = def_frag();
            float t = (sin(u_time * 4.0) + 1.0) / 2.0;
            return mix(c, vec4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, c.a), t);
        }
    `,
    ); 
});
}