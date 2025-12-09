export default function init() {
  loadSprite("sheep", ["./sprites/sheep1.png", "./sprites/sheep2.png"], {
    anims: {
      idle: { from: 0, to: 0 },
      walk: { from: 0, to: 1, loop: true, speed: 8 },
    },
  });

  loadSprite("hill1", "./sprites/hills.png");
  loadSprite("sky1", "./sprites/sky.png");
  loadSprite("jet", "./sprites/jet.png");

  // Load boss sprites with animations
  loadSprite(
    "boss",
    [
      "./sprites/custerboss/1.png",
      "./sprites/custerboss/2.png",
      "./sprites/custerboss/3.png",
      "./sprites/custerboss/4.png",
    ],
    {
      anims: {
        idle: { from: 0, to: 2, loop: true, speed: 6 }, // Frames 1-3
        shoot: { from: 3, to: 3, loop: false }, // Frame 4 (shooting)
      },
    }
  );

  loadSprite("bean", "./sprites/bean.png").then((data) => {
    let loadedSpriteData = getSprite("bean").data;

    // Hill as BACKGROUND only (no area/body)
    add([
      sprite("hill1"),
      pos(0, height()),
      anchor("botleft"),
      scale(1.0), // Adjusted scale - try this
      z(-1), // Put behind other objects
    ]);

    add([
      sprite("sky1"),
      pos(0, 0),
      anchor("topleft"),
      scale(1.0), // Adjusted scale - try this
      z(-2), // Put behind other objects
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
    `
    );

    loadShader(
      "redGlow",
      null,
      `
        uniform float u_time;
        
        vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
            vec4 c = def_frag();
            float pulse = (sin(u_time * 12.0) + 1.0) / 2.0; 
            vec3 redColor = vec3(1.0, 0.0, 0.0);   
            vec3 whiteColor = vec3(1.2, 1.2, 1.2); 
            vec3 flashColor = mix(redColor, whiteColor, pulse); 
            vec3 tinted = c.rgb * flashColor; 
            return vec4(tinted, c.a);
        }
    `
    );
  });
}
