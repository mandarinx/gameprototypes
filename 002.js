var tile_size   = 32;
var gwt         = 12;
var ght         = 16;
var gw          = tile_size * gwt;
var gh          = tile_size * ght;

var vel         = 200;
var hole_size = 2;
var dir         = 1;
var jump_force  = 380;
var jump_buffer = 5;

var floor_height = 4;
var last_floor = 0;
var first_floor_row = 3;
var floors_data = [];
var cur_floor = 0;
var player_floor;

var game = new Phaser.Game(gw, gh, Phaser.CANVAS, 'game');

function pixel(index) {
    return index * tile_size;
}

var mainState = {

    preload: function() {
        game.stage.backgroundColor = '#71c5cf';
        game.load.image('player', './assets/bird.png');
        game.load.image('floor', './assets/pipe.png');
        game.load.image('sky', './assets/sky.png');
        game.load.bitmapFont('Boxy-Bold', './fonts/boxy_bold_16.png',
                                          './fonts/boxy_bold_16.xml');
    },

    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // - - - - - input

        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        // - - - - - entities

        this.sky = game.add.tileSprite(0, 0, gw, gh, 'sky');

        this.player = this.game.add.sprite(pixel(5), pixel(11), 'player');
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;
        this.player.body.collideWorldBounds = true;

        this.floors = game.add.group();
        this.floors.enableBody = true;
        this.floors.physicsBodyType = Phaser.Physics.ARCADE;

        this.floors.createMultiple(gwt * 16, 'floor');
        this.floors.setAll('body.immovable', true);

        this.createFloors();

        console.log(this.floors.countDead());
        console.log(this.floors.countDead());
        // create new floor each time player jumps up a floor
        // this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        // - - - - - gui

        this.score = 0;
        this.labelScore = game.add.bitmapText(16, 16, 'Boxy-Bold', '0', 16);

        // - - - - - camera

        game.camera.follow(this.player);
        var dead_top = 10;
        game.camera.deadzone = new Phaser.Rectangle(0, pixel(dead_top),
                                                    gw, pixel(ght - dead_top));
    },

    update: function() {
        this.drawFloors();

        this.touching_floor = false;

        if (this.player.body.x >= (gw - tile_size)) {
            dir = -1;
        }
        if (this.player.body.x <= 0) {
            dir = 1;
        }

        if (this.player.body.x >= (gw - (tile_size + jump_buffer)) ||
            this.player.body.x <= jump_buffer) {
            this.touching_floor = true;
        }

        this.player.body.velocity.x = 100 * dir;

        game.physics.arcade.collide(this.player, this.floors, this.floorCollide, null, this);
        // this.sky.tilePosition.x -= 3.1;
        // this.removeFloors();
    },

    render: function() {
    //     var zone = game.camera.deadzone;
    //     game.context.fillStyle = 'rgba(255,0,0,0.6)';
    //     game.context.fillRect(zone.x, zone.y, zone.width, zone.height);
        this.floors.forEach(function(f) {
            game.debug.body(f);
        });
    },

    jump: function() {
        if (this.touching_floor) {
            this.player.body.velocity.y = -jump_force;
        }
    },

    floorCollide: function(player, floor) {
        this.touching_floor = true;
        // console.log(this.touching_floor);
    },

    restartGame: function() {
        game.state.start('main');
    },

    createFloors: function() {
        for (var y=0; y<ght; y++) {

            if (y === first_floor_row) {
                var row = [];
                for (var i=0; i<gwt; i++) {
                    row.push(1);
                }
                floors_data.push(row);
                last_floor = y;
                continue;
            }

            if (y - last_floor === floor_height) {
                floors_data.push(this.createFloor());
                last_floor = y;
            } else {
                floors_data.push([]);
            }
        }
    },

    createFloor: function() {
        var hole = Math.floor(Math.random() * (gwt - hole_size));
        var list = [];
        var val = 0;
        for (var i = 0; i < gwt; i++) {
            val = 0;
            if (i < hole || i > hole + hole_size) {
                val = 1;
            }
            list.push(val);
        }
        return list;
        // this.score += 1;
        // this.labelScore.text = this.score;
    },

    drawFloors: function() {
        if (cur_floor === player_floor) {
            return;
        }

        for (var y=0, yl=floors_data.length; y<yl; y++) {
            var row = floors_data[y];
            for (var x=0, xl=row.length; x<xl; x++) {
                var val = row[x];
                if (val === 1) {
                    var f = this.floors.getFirstDead();
                    f.reset(x * tile_size, pixel(ght - y));
                }
            }
        }

        cur_floor = player_floor;
    },

    removeFloors: function() {
    },

    addOnePipe: function(x, y) {
        var floor = this.floors.getFirstDead();
        floor.reset(x, y);
        floor.body.velocity.x = -vel;
        floor.checkWorldBounds = true;
        floor.outOfBoundsKill = true;
    },
};

game.state.add('main', mainState);
game.state.start('main');
