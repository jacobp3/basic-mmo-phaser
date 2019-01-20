var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player, stars, bombs, platforms, cursors, score = 0, gameOver = true, scoreText, gameContext, g1b0, g1b1, lastX, lastY, nowX, nowY, startTime, lastTime, currentTime, threshold = 50, public = false, background, pie1, button0, button1, button2, game = new Phaser.Game(config);

function preload ()
{
    gameContext = this;
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('pie1', 'assets/pie1.png');
    this.load.image('pie2', 'assets/pie2.png');
    this.load.image('newgame', 'assets/newgame2.png');
    this.load.image('mainscreen', 'assets/mainscreen.png');
    this.load.image('handheld', 'assets/handheld.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
//    this.load.spritesheet('button', 'assets/sprites/button_sprite_sheet.png', { frameWidth: 193, frameHeight: 71 });
}

function create()
{
    button1 = this.add.sprite(400, 300, 'newgame').setInteractive().on('pointerdown', () => startGame1(this) );
}

function startGame1 (context)
{
    button1.visible = false;
    button1.y = -500

    //  A simple background for our game
    background = context.add.image(400, 300, 'sky');

    g1b0 = context.add.sprite(400, 300, 'mainscreen').setInteractive().on('pointerdown', () => publicDisplay(context) );
    g1b1 = context.add.sprite(400, 500, 'handheld').setInteractive().on('pointerdown', () => privateDisplay(context) );
}

function publicDisplay (context)
{
    public = true;
    g1b0.destroy();
    g1b1.destroy();
    scoreText = context.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
//    scoreText.setText('Score: ' + score);
    Client.askNewHost();
}

function privateDisplay (context)
{
    pie1 = gameContext.physics.add.sprite(400, 500, 'pie1').setScale(.2);
    pie1.setInteractive();
    gameContext.input.setDraggable(pie1);

    gameContext.input.on('dragstart', function (pointer, gameObject) {

        gameObject.setVelocityX(0);
        gameObject.setVelocityY(0);
        currentTime = new Date().getTime();
        startTime = currentTime;
        gameContext.children.bringToTop(gameObject);

    }, gameContext);

    gameContext.input.on('drag', function (pointer, gameObject, dragX, dragY) {

        gameObject.x = dragX;
        gameObject.y = dragY;
        t = new Date().getTime();
        if (t - currentTime >= 10) {
            lastTime = currentTime;
            currentTime = t;
            lastX = nowX;
            lastY = nowY;
            nowX = dragX;
            nowY = dragY;
        }
    });

    gameContext.input.on('dragend', function (pointer, gameObject) {

        t = new Date().getTime();
        if (t - startTime >= 200) {
            gameObject.setVelocityX((nowX - lastX)*10);
            gameObject.setVelocityY((nowY - lastY)*10);
        }
    }, gameContext);

    g1b0.destroy();
    g1b1.destroy();
    Client.askNewPlayer();
}
/*
function startGame0 (context)
{
    button0.destroy();
    button1.destroy();
    button2.destroy();

    gameOver = false;

    //  A simple background for our game
    context.add.image(400, 300, 'sky');

    // The player and its settings
    player = context.physics.add.sprite(100, 450, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    context.anims.create({
        key: 'left',
        frames: context.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    context.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    context.anims.create({
        key: 'right',
        frames: context.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    cursors = context.input.keyboard.createCursorKeys();

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = context.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = context.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = context.physics.add.group();

    //  The score
    scoreText = context.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    context.physics.add.collider(player, platforms);
    context.physics.add.collider(stars, platforms);
    context.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    context.physics.add.overlap(player, stars, collectStar, null, context);

    context.physics.add.collider(player, bombs, hitBomb, null, context);
}*/

function update ()
{
    if (typeof(pie1) !== 'undefined') {
        if (pie1.y < -200 || pie1.x < -200 || pie1.x > 1000 || pie1.y > 1000) {
            if (pie1.y < -200) {
                Client.sendPie(nowX, (nowX - lastX)*10,(nowY - lastY)*10);
            }
            pie1.x = 400;
            pie1.y = 500;
            pie1.setVelocityX(0);
            pie1.setVelocityY(0);
        }
    }
/*
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
*/
}
/*
function collectStar (player, star)
{
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}
*/
var playerMap = {};

function addNewPlayer (id,x,y){
    playerMap[id] = gameContext.add.sprite(x,y,'dude');
//    if (!public) {
        playerMap[id].visible = false;
//    }
}

function publicPie (x,xVel,yVel) { //need player id to set color/type
    if (public) {
        var pie = gameContext.physics.add.sprite(x, 800, 'pie1').setScale(.2);
        pie.setVelocityX(xVel);
        pie.setVelocityY(yVel);
        pie.setDrag(50, 50);
    }
//    var player = playerMap[id];
//    var distance = Phaser.Math.Distance.Between(player.x,player.y,x,y);
//    var tween = gameContext.tweens.add({
//        targets: player,
//        x:x,
//        y:y,
//        duration:distance*10
//    });
}

function removePlayer (id){
    playerMap[id].destroy();
    delete playerMap[id];
}
