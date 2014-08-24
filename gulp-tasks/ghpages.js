var gh_pages        = require('gulp-gh-pages');
var cfg             = require('../gulp-config.json');
var pkg             = require('../package.json');

var options = {
    remoteUrl:  pkg.repository.url,
    push:       false
}

module.exports = function(gulp) {
    gulp.task('ghpages', function () {
        gulp.src(cfg.dir.src.games + '**/*.*')
            .pipe(gh_pages())
            .pipe(gulp.dest('.tmp'));
    });
}
