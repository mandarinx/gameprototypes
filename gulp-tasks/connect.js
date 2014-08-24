var connect         = require('gulp-connect');
var cfg             = require('../gulp-config.json');

var source = cfg.dir.src.games + '**/*.*';

module.exports = function(gulp) {
    gulp.task('connect', function() {
        connect.server({
            root: cfg.dir.src.games,
            port: 8000,
            host: 'localtest.me',
            livereload: true
        });
    });

    gulp.watch(source, { maxListeners: 999 }, function() {
        gulp.src(source).pipe(connect.reload());
    });

}
