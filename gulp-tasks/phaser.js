var cfg             = require('../gulp-config.json');

var phaser_build = 'node_modules/phaser/build/';
var games = 'games/';

module.exports = function(gulp) {
    gulp.task('phaser', function() {
        gulp.src(phaser_build+'phaser.js').pipe(gulp.dest(games));
        gulp.src(phaser_build+'phaser.map').pipe(gulp.dest(games));
        gulp.src(phaser_build+'phaser.min.js').pipe(gulp.dest(games));
    });
}
