import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the k. prefix
import init from "./init";

kaplay();

const FLOOR_HEIGHT = 48;
const JUMP_FORCE = 800;
const SUPER_JUMP_FORCE = 1200;
const SPEED = 480;

let particleEmitter = null;
let jumpCounter = 0;
let comboCount = 0;

onUpdate(() => {
    healthBar.pos.x = sheep.pos.x - 30;
    healthBar.pos.y = sheep.pos.y - 50;
});

scene("game", () => {
    // define gravity
    setGravity(1600);

    loadRoot("./"); // A good idea for Itch.io publishing later

    init();


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
            
            // Give a little bounce after stomp
            sheep.jump(400);
        } else {
            // Jet hit sheep from front = DAMAGE!
            sheep.hurt(25);  // 25% of 100 health
            shake(12);
            
            // Optional: knockback the sheep
            sheep.pos.x -= 50;
            
            // Destroy the jet after hitting (or keep it if you want it to fly through)
            destroy(jet);
            
            // Check for game over
            if (sheep.hp() <= 0) {
                go("gameover");  // Create this scene or use go("game") to restart
            }
        }
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
            jumpCounter++;
            sheep.jump(JUMP_FORCE);
        } 
        if (jumpCounter === 2) {
            sheep.jump(SUPER_JUMP_FORCE);
            addKaboom(sheep.pos);
            jumpCounter = 0;
        }
       if (jumpCounter >= 3) {
        jumpCounter = 0;
        sheep.jump(0);
       }
    });

    onKeyDown("down", () => {
        sheep.move(SPEED, 200);
    });


});

go("game");