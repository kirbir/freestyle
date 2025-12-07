import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

kaplay();

const FLOOR_HEIGHT = 48;
const JUMP_FORCE = 800;
const SPEED = 480;

let particleEmitter = null;

onUpdate(() => {
    if (particleEmitter) {
        particleEmitter.emit(1);

    }
});

scene("game", () => {
    // define gravity
    setGravity(1600);

    loadRoot("./"); // A good idea for Itch.io publishing later
    loadSprite("sheep1", "./sprites/sheep1.png");
    loadSprite("hill1", "./sprites/hills.png");
    loadSprite("bean", "./sprites/bean.png").then((data) => {
        let loadedSpriteData = getSprite("bean").data;
        // Fun fact: the data parameter passed from the promise is the same as getSprite().data
        add([
            sprite("hill1"),
            pos(0, height()),
            anchor("botleft"),
            scale(width() / 900, 1),  // Adjust 200 to your sprite's actual width
            area(),
            body({ isStatic: true }),
        ]);


    });

    const sheep = add([
        pos(0, 0),
        sprite("sheep1"), area(),
        body(),
    ]);

    add([pos(120, 80), sprite("hill1")]);
    onClick(() => addKaboom(mousePos()));





    onKeyPress("right", () => {
        sheep.move(200, 0);
    });

    onKeyPress("left", () => {
        sheep.move(-200, 0);
    });

    onKeyPress("up", () => {
        sheep.move(0, -200);
    });

    onKeyPress("down", () => {
        sheep.move(0, 200);
    });


});

go("game");