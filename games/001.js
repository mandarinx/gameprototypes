var gw = 384;
var gh = 512;
var tile_size = 32;
var tiles_v = gh/tile_size;
var vel = 200;
var hole_height = 2;

var game = new Phaser.Game(gw, gh, Phaser.CANVAS, 'game');

var mainState = {

    preload: function() {
        game.stage.backgroundColor = '#71c5cf';
        game.load.image('bird', './assets/bird.png');
        game.load.image('pipe', './assets/pipe.png');
        game.load.image('sky', './assets/sky.png');
        game.load.bitmapFont('Boxy-Bold', './fonts/boxy_bold_16.png',
                                          './fonts/boxy_bold_16.xml');
    },

    create: function() {
        this.sky = game.add.tileSprite(0, 0, gw, gh, 'sky');

        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.bird = this.game.add.sprite(96, 224, 'bird');

        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;

        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        this.pipes = game.add.group();
        this.pipes.enableBody = true;
        this.pipes.createMultiple(32, 'pipe');

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        this.score = 0;
        // this.labelScore = game.add.text(16, 16, "0", { font: "30px Arial", fill: "#ffffff" });
        this.labelScore = game.add.bitmapText(16, 16, 'Boxy-Bold', '0', 16);

    },

    update: function() {
        if (this.bird.inWorld === false) {
            this.restartGame();
        }

        game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);
        this.sky.tilePosition.x -= 3.1;
    },

    jump: function() {
        this.bird.body.velocity.y = -350;
    },

    restartGame: function() {
        game.state.start('main');
    },

    addOnePipe: function(x, y) {
        var pipe = this.pipes.getFirstDead();
        pipe.reset(x, y);
        pipe.body.velocity.x = -vel;
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        var hole = Math.floor(Math.random() * (tiles_v - hole_height));

        for (var i = 0; i < tiles_v; i++) {
            if (i < hole || i > hole + hole_height) {
                this.addOnePipe(gw, i * tile_size);
            }
        }

        this.score += 1;
        this.labelScore.text = this.score;
    },
};

game.state.add('main', mainState);
game.state.start('main');
