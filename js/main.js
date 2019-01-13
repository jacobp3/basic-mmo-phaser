
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = true;
var scoreText;
var gameContext;

var game = new Phaser.Game(config);

function preload ()
{
    gameContext = this;
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('button', 'assets/sprites/button_sprite_sheet.png', { frameWidth: 193, frameHeight: 71 });
}

var button0, button1, button2;

function create()
{
    button0 = this.add.sprite(400, 300, 'button', 0).setInteractive().on('pointerdown', () => startGame0(this) );
    button1 = this.add.sprite(400, 400, 'button', 1).setInteractive().on('pointerdown', () => startGame1(this) );
    button2 = this.add.sprite(400, 500, 'button', 2).setInteractive().on('pointerdown', () => startGame2(this) );
}

function startGame2 (context)
{
}

var g1b0, g1b1, downX, upX, downY, upY, threshold = 50, public = false, background;


function startGame1 (context)
{
    button0.destroy();
    button1.destroy();
    button2.destroy();

    //  A simple background for our game
    background = context.add.image(400, 300, 'sky');

    g1b0 = context.add.sprite(400, 300, 'button').setInteractive().on('pointerdown', () => publicDisplay(context) );
    g1b0.setFrame(0);

    g1b1 = context.add.sprite(400, 400, 'button').setInteractive().on('pointerdown', () => privateDisplay(context) );
    g1b0.setFrame(1);
}

function publicDisplay (context)
{
    public = true;
    g1b0.destroy();
    g1b1.destroy();
    Client.askNewHost();
}

function privateDisplay (context)
{
    background.setInteractive();
//    background.on('pointerdown', getCoordinates, context);
    background.on('pointerdown', function (pointer) {
      	downX = pointer.x;
      	downY = pointer.y;
    });

    background.on('pointerup', function (pointer) {
        distX = pointer.x - downX;
      	distY = pointer.y - downY;
        dist = Math.sqrt(distX*distX + distY*distY);
        if (dist > threshold) {
//            angle = Math.atan2(distY, distX);
            Client.sendClick(distX,distY);
        }
    });

    g1b0.destroy();
    g1b1.destroy();
    Client.askNewPlayer();
}

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
}

function update ()
{
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
}

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

var playerMap = {};

function addNewPlayer (id,x,y){
    playerMap[id] = gameContext.add.sprite(x,y,'dude');
    if (!public) {
        playerMap[id].visible = false;
    }
}

function movePlayer (id,x,y){
    var player = playerMap[id];
    var distance = Phaser.Math.Distance.Between(player.x,player.y,x,y);
    var tween = gameContext.tweens.add({
        targets: player,
        x:x,
        y:y,
        duration:distance*10
    });
}

function removePlayer (id){
    playerMap[id].destroy();
    delete playerMap[id];
}
