var gulp            = require("gulp"),
    jade            = require("gulp-jade"),
    compass         = require("gulp-compass"),
    minifyCSS       = require("gulp-minify-css"),
    connect         = require("gulp-connect"),
    browserSync     = require("browser-sync"),
    reload          = browserSync.reload;


// LOCAL SERVER
gulp.task("webserver", function() {
  connect.server({
    port:8080
  });
});

// INIT BROWSER SYNC
gulp.task("browser-sync", function() {
    browserSync({
        proxy:"http://localhost:8080"
    });
});

// COMPILE JADE
gulp.task("views", function() {
  
    // INDEX PAGE
    gulp.src("index.jade")
        .pipe(jade({
            pretty:true
        }))
        .pipe(gulp.dest("."));
    gulp.src("features/src/**/*.jade")
        .pipe(jade({

        }))
        .pipe(gulp.dest("features/dest/"));

});

// COMPILE SASS
gulp.task("styles", function() {
    return gulp.src("styles/sass/**/*.scss")
               .pipe(compass({
                    css:"./styles/stylesheets",
                    sass:"./styles/sass"
                }))
               .pipe(minifyCSS())
               .pipe(gulp.dest("styles/stylesheets/"));
});



gulp.task("default",["webserver","browser-sync"], function() {
    gulp.watch("features/src/**/*.jade", ["views",browserSync.reload]);
    gulp.watch("index.jade",["views",browserSync.reload]);
    gulp.watch("styles/sass/**/*.scss",["styles",browserSync.reload]);
});