var tile_size   = 32;
var gwt         = 16;
var ght         = 8;
var gw          = tile_size * gwt;
var gh          = tile_size * ght;

var boost_force = 150;
var abduction_force = 200;
var gravity = 500;
var speed = 1.5;
var score = 0;
var beam;
var ufo;
var cows;
var ground;
var emitter;
var bounces = 0;
var crashed = false;
var cow_time = {
    next: 0,
    start_offset: 1000,
    min: 600,
    max: 2000
};

var game = new Phaser.Game(gw, gh, Phaser.CANVAS, 'game', null, false, false);

function pixel(index) {
    return index * tile_size;
}

var mainState = {

    preload: function() {
        game.stage.backgroundColor = '#71c5cf';
        game.load.image('ufo',      './assets/ufo.png');
        game.load.image('cow',      './assets/cow.png');
        game.load.spritesheet('dirt', './assets/dirt-greeble.png', 4, 4);
        game.load.spritesheet('beam', 'assets/beam.png', 100, 336);
        game.load.image('ground',   './assets/ground-night.png');
        game.load.image('sky',      './assets/sky-night.png');
        game.load.bitmapFont('Boxy-Bold', './fonts/boxy_bold_16.png',
                                          './fonts/boxy_bold_16.xml');
    },

    create: function() {
        this.getNextCowTime();

        // - - - - - settings

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = gravity;

        // - - - - - entities

        this.sky = game.add.tileSprite(0, 0, gw, gh, 'sky');
        beam    = game.add.sprite(      pixel(4),       pixel(3), 'beam', 0);
        ufo     = game.add.sprite(      pixel(4),       pixel(3), 'ufo');
        ground  = game.add.tileSprite(  pixel(-2),      pixel(ght-1),
                                        pixel(gwt+4),   pixel(1), 'ground');

        game.physics.enable([beam, ufo, ground], Phaser.Physics.ARCADE);

        beam.anchor.x = 0.5;
        beam.animations.add('off',      [0]);
        beam.animations.add('beaming',  [1]);
        beam.body.setSize(28, 336, 0, 0);

        ufo.name = 'ufo';
        ufo.anchor.x = 0.5;
        ufo.anchor.y = 0.5;
        ufo.body.bounce.set(0.5);

        ground.body.immovable = true;
        ground.body.allowGravity = false;

        cows = game.add.group();
        cows.enableBody = true;
        cows.physicsBodyType = Phaser.Physics.ARCADE;

        cows.createMultiple(10, 'cow', 0, false);
        cows.forEach(function(cow) {
            cow.checkWorldBounds = true;
            cow.outOfBoundsKill = true;
            cow.name = 'cow';
            cow.anchor.setTo(0.5, 1);
            cow.body.setSize(28, 24);
            cow.body.bounce.set(0.3);
        });

        // - - - - - particles

        emitter = game.add.emitter(0, 0, 100);
        emitter.makeParticles('dirt');
        emitter.gravity = gravity;
        emitter.setSize(16, 4);
        emitter.setXSpeed(-speed*50, -(speed*70));
        emitter.setYSpeed(-150, -300);
        game.physics.enable(emitter, Phaser.Physics.ARCADE);

        // - - - - - gui

        this.labelScore = game.add.bitmapText(16, 16, 'Boxy-Bold', '0', 16);

        // - - - - - camera

        var dead_top = 10;
        game.camera.deadzone = new Phaser.Rectangle(0, pixel(dead_top),
                                                    gw, pixel(ght - dead_top));
    },

    update: function() {
        game.physics.arcade.collide(ufo, ground, this.ufoLand, null, this);
        game.physics.arcade.collide(cows, ground, this.cowLand, null, this);
        game.physics.arcade.overlap(beam, cows, this.elevate, null, this);
        game.physics.arcade.collide(emitter, ground);

        if (!crashed) {
            game.physics.arcade.collide(ufo, cows, this.abduct, null, this);
        }

        beam.y = ufo.y + 4;
        beam.x = ufo.x;

        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) &&
            !crashed) {
            this.boost();
        } else {
            beam.animations.play('off');
        }

        if (this.spawnCow()) {
            var cow = cows.getFirstDead();
            cow.reset(pixel(gwt), pixel(ght - 1), 100);
            cow._abducting = false;
            cow.body.angularVelocity = 0;
            cow.angle = 0;
        }

        this.sky.tilePosition.x -= speed * 0.7;
        ground.tilePosition.x -= speed;

        cows.forEachAlive(function(cow) {
            cow.x -= (speed * cow._abducting ? 0.6 : 1.5);
            if (cow._abducting &&
                cow.body.velocity.y !== 0 &&
                cow.y < pixel(ght - 1)) {
                cow.body.angularVelocity = Math.random() * 50;
            }
        });

        this.labelScore.text = 'Score '+score;
    },

    render: function() {
        // game.debug.body(beam);
        // cows.forEachAlive(function(cow) {
        //     game.debug.body(cow);
        // });
    },

    spawnCow: function() {
        if (game.time.now < cow_time.next) {
            return false;
        }
        this.getNextCowTime();
        return true;
    },

    getNextCowTime: function() {
        if (cow_time.next === 0) {
            cow_time.next = game.time.now + cow_time.start_offset;
        } else {
            cow_time.next = game.time.now + cow_time.min + (Math.random() * cow_time.max);
        }
    },

    boost: function() {
        ufo.body.velocity.y = -boost_force;
        beam.body.velocity.y = -boost_force;
        beam.animations.play('beaming');
    },

    cowLand: function(ground, cow) {
        cow._abducting = false;
        cow.body.angularVelocity = 0;
    },

    ufoLand: function(ufo, ground) {
        crashed = true;
        ufo.body.angularVelocity = (Math.random() * 150) + 150;
        emitter.x = ufo.x;
        emitter.y = pixel(ght-1);
        emitter.start(true, 500, null, 10);
        if (bounces > 1) {
            ufo.body.angularVelocity = 0;
            this.restartGame();
        } else {
            bounces++;
        }
    },

    elevate: function(beam, cow) {
        if (beam.animations.currentAnim.name === 'beaming') {
            cow._abducting = true;
            cow.body.velocity.y = -abduction_force;
        }
    },

    abduct: function(ufo, cow) {
        score++;
        cow.kill();
    },

    restartGame: function() {
        crashed = false;
        score = 0;
        bounces = 0;
        cow_time.next = 0;
        game.state.start('main');
    },
};

game.state.add('main', mainState);
game.state.start('main');
