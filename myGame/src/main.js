import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the k. prefix
import init from "./init";

kaplay({
    background: [0,0,0],
});

const FLOOR_HEIGHT = 48;
const JUMP_FORCE = 800;
const SUPER_JUMP_FORCE = 1200;
const SPEED = 480;

let particleEmitter = null;
let jumpCounter = 0;
let comboCount = 0;

onUpdate(() => {

});

scene("game", () => {
    // define gravity
    setGravity(1600);

    loadRoot("./"); // A good idea for Itch.io publishing later

    init();
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
    outline(3, rgb(0, 0, 0)),
    fixed(),
    z(102),
]);

// Combo display
const comboText = add([
    text("COMBO: 0", { size: 24 }),
    pos(width() / 2, 60),
    anchor("center"),
    fixed(),
    z(100),
    color(255, 255, 0),  // Yellow
    outline(4, rgb(0, 0, 0)), 
]);

// The gate on the right side
const gate = add([
    rect(40, 150),
    pos(width() - 60, height() - FLOOR_HEIGHT - 150),
    color(150, 75, 0),      // Brown/closed
    area(),
    body({ isStatic: true }),
    "gate",
]);

// Gate label
const gateLabel = add([
    text("LOCKED", { size: 16 }),
    pos(width() - 80, height() - FLOOR_HEIGHT - 180),
    color(255, 0, 0),
    fixed(),
    z(100),
]);


    // Add invisible FLOOR for physics/gravity
    add([
        pos(0, height() - FLOOR_HEIGHT),
        rect(width(), FLOOR_HEIGHT),
        opacity(0),  // Green color (or use opacity(0) to make invisible)
        area(),
        body({ isStatic: true }),
        "floor",
    ]);

    const sheep = add([
        sprite("sheep"),  // Changed from "sheep1" to "sheep"
        pos(400, -600),
        area(),
        body(),
        health(100),
    ]);

    // Remove or keep this as a decorative element only
   
    onClick(() => addKaboom(mousePos()));

    function spawnJet() {
        add([
            sprite("jet"),
            pos(width() + 50, rand(80, height() - 150)),  // Spawns just off the RIGHT edge
            area(),
            move(LEFT, rand(150, 600)),  // Flies LEFT at random speed
            offscreen({ destroy: true }), // Auto-destroys when it exits left side
            "enemy",
            "jet",
            shader("invert", () => ({
                u_time: time(),
            })),
        ]);
    }

    let jetsSpawned = 0;

    const spawnInterval = loop(1.5, () => {
        if (jetsSpawned < 10) {
            spawnJet(); 
            jetsSpawned++;
        } else {
            spawnInterval.cancel();
        }
    });



    sheep.onCollide("jet", (jet) => {
        // Check if sheep is falling AND is above the jet (stomping)
        const sheepBottom = sheep.pos.y + sheep.height;
        const jetTop = jet.pos.y;
        const isFalling = sheep.vel.y > 0;  // Moving downward
        
        // If sheep is coming from above and falling = STOMP!
        if (isFalling && sheepBottom <= jetTop + 30) {
            // Destroy the jet
            destroy(jet);
            shake(8);
            addKaboom(jet.pos);
            comboCount++;
            comboText.text = `COMBO: ${comboCount}`;

                    // Check if combo reached 3 - OPEN THE GATE!
        if (comboCount >= 3 && !gateOpen) {
            gateOpen = true;
            gate.color = rgb(0, 255, 0);  // Green = open
            gateLabel.text = "OPEN!";
            gateLabel.color = rgb(0, 255, 0);
            shake(20);
            
            // Make gate passable (remove collision)
            gate.unuse("body");
        }
            
            // Give a little bounce after stomp
            sheep.jump(400);
        } else {
            // Jet hit sheep from front = DAMAGE!
            sheep.hurt(25);  // 25% of 100 health
            healthBar.width = sheep.hp() / 100 * 200;
            healthText.text = `${sheep.hp()}/100`;
            shake(12);
            
            // Optional: knockback the sheep
            sheep.pos.x -= 50;
            
            // Destroy the jet after hitting (or keep it if you want it to fly through)
            destroy(jet);

            comboCount = 0;
            comboText.text = `COMBO: ${comboCount}`;
            
            // Check for game over
            if (sheep.hp() <= 0) {
                go("gameover");  // Create this scene or use go("game") to restart
            }
        }
    });

    sheep.onGround(() => {
        jumpCounter = 0;
        comboCount = 0;
        comboText.text = `COMBO: ${comboCount}`;
    });

    onKeyDown("right", () => {
        sheep.move(SPEED, 0);
    });

    onKeyPress("right", () => {
        sheep.play("walk");
    });

    onKeyRelease("right", () => {
        sheep.play("idle");
    });

    onKeyDown("left", () => {
        sheep.move(-SPEED, 0);
    });

    onKeyPress("left", () => {
        sheep.play("walk");
    });

    onKeyRelease("left", () => {
        sheep.play("idle");
    });

    onKeyPress("up", () => {
        if (sheep.isFalling() || sheep.isGrounded()) {
            if (jumpCounter !== 10) {
                jumpCounter++;
                sheep.jump(JUMP_FORCE);
            }
        } 
        if (jumpCounter === 2) {
            sheep.jump(SUPER_JUMP_FORCE);
            addKaboom(sheep.pos);
            jumpCounter = 10;
        }
       if (jumpCounter === 10 && sheep.isGrounded()) {
        jumpCounter = 0;
        comboCount = 0;
        comboText.text = `COMBO: ${comboCount}`;
        sheep.jump(0);
       }
    });

    onKeyDown("down", () => {
        sheep.move(SPEED, 200);
    });

    scene("win", (level) => {
        add([
            text(`LEVEL ${level - 1} COMPLETE!`, { size: 48 }),
            pos(width() / 2, height() / 2 - 50),
            anchor("center"),
            color(255, 215, 0),  // Gold
        ]);
        
        add([
            text("Press SPACE for next level", { size: 24 }),
            pos(width() / 2, height() / 2 + 50),
            anchor("center"),
        ]);
        
        onKeyPress("space", () => {
            go("game");  // You could pass level number to increase difficulty
        });
    });


});

go("game");