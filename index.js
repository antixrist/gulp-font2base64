var through = require('through2'),
    gutil   = require('gulp-util'),
    path    = require('path')
;

var template = [
  '@font-face {',
  '  font-family: "{{name}}";',
  '  font-style: normal;',
  '  font-weight: 400;',
  '  src: local("{{name}}"),',
  '       url("data:application/x-font-{{format}};base64,{{base64}}") format("{{format}}");',
  '}'
].join('\n');

module.exports = function() {

  // create a stream through which each file will pass
  return through.obj(function(file, enc, callback) {

    if (file.isNull()) {
      this.push(file);
      // do nothing if no contents
      return callback();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-font64', 'Streaming not supported'));
      return callback();
    }

    if (file.isBuffer()) {
      var base64   = new Buffer(file.contents).toString('base64');
      var extName  = path.extname(file.path);
      var format   = extName.replace(/^\./, '');
      var fileName = path.basename(file.path, extName);
      var output   = template
        .replace(new RegExp('{{name}}', 'g'), fileName)
        .replace(new RegExp('{{format}}', 'g'), format)
        .replace(new RegExp('{{base64}}'), base64);

      file.contents = new Buffer(output);
      file.path = gutil.replaceExtension(file.path, '.css');

      return callback(null, file);
    }
  });
};
