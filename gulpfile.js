var requireDir      = require('require-dir');
var gulp            = require('gulp');
var cfg             = require('./gulp-config.json');
var yargs           = require('yargs');

var tasks           = requireDir('./gulp-tasks');

var argv = yargs.argv;
var task_name = argv._[0];

DEVELOPMENT = task_name === 'bundle' ? false : true;

require('gulp-help')(gulp);

Object.keys(tasks).forEach(function(task) {
    tasks[task](gulp);
});

gulp.task('default', ['connect'], function() {});

gulp.task('deploy', ['ghpages'], function() {});
