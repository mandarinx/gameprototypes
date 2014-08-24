var tile_size   = 32;
var gwt         = 12;
var ght         = 16;
var gw          = tile_size * gwt;
var gh          = tile_size * ght;
var tiles_v     = gh / tile_size;

var vel         = 200;
var hole_height = 2;

var game = new Phaser.Game(gw, gh, Phaser.CANVAS, 'game');

function pixel(index) {
    return index * tile_size;
}

var mainState = {

    preload: function() {
        game.stage.backgroundColor = '#71c5cf';
        game.load.image('bird', './assets/bird.png');
        game.load.image('floor', './assets/pipe.png');
        game.load.image('sky', './assets/sky.png');
        game.load.bitmapFont('Boxy-Bold', './fonts/boxy_bold_16.png',
                                          './fonts/boxy_bold_16.xml');
    },

    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // - - - - -

        this.sky = game.add.tileSprite(0, 0, gw, gh, 'sky');

        this.bird = this.game.add.sprite(pixel(5), pixel(11), 'bird');
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;

        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        this.floors = game.add.group();
        this.floors.enableBody = true;
        this.floors.physicsBodyType = Phaser.Physics.ARCADE;
        this.floors.setAll('immovable', true);
        this.floors.createMultiple(gwt * 4, 'floor');

        this.createFirstFloor();

        // create new floor each time player jumps up a floor
        // this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        this.score = 0;
        this.labelScore = game.add.bitmapText(16, 16, 'Boxy-Bold', '0', 16);
    },

    update: function() {
        if (this.bird.inWorld === false) {
            this.restartGame();
        }

        game.physics.arcade.collide(this.bird, this.floors);
        // this.sky.tilePosition.x -= 3.1;
    },

    jump: function() {
        this.bird.body.velocity.y = -350;
    },

    restartGame: function() {
        game.state.start('main');
    },

    createFirstFloor: function() {
        for (var i=0; i<gwt; i++) {
            var f = this.floors.getFirstDead();
            f.reset(i * tile_size, pixel(14));
        }
    },

    addOnePipe: function(x, y) {
        var floor = this.floors.getFirstDead();
        floor.reset(x, y);
        floor.body.velocity.x = -vel;
        floor.checkWorldBounds = true;
        floor.outOfBoundsKill = true;
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
