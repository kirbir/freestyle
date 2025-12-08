
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
        pos(0, 100),
        anchor("topleft"),
        scale(width() / 900, 1),
        z(-2),  // Put behind other objects
    
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