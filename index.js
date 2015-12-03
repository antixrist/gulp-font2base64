var through = require('through2'),
    gutil   = require('gulp-util'),
    path    = require('path')
;

var template = [
  '@font-face {',
  '  font-family: "{{fileName}}";',
  '  font-style: normal;',
  '  font-weight: 400;',
  '  src: local("{{fileName}}"),',
  '       url("data:application/x-font-{{extName}};base64,{{base64}}") format("{{extName}}");',
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
      var extName  = path.extname(file.path).replace('^\.', '');
      var fileName = path.basename(file.path, extName);
      var output   = template
        .replace(new RegExp('{{fileName}}', 'g'), fileName)
        .replace(new RegExp('{{extName}}', 'g'), extName)
        .replace(new RegExp('{{base64}}'), base64);

      file.contents = new Buffer(output);
      file.path = gutil.replaceExtension(file.path, '.css');

      return callback(null, file);
    }
  });
};


return;

//var through2 = require('through2'),
//    gutil = require('gulp-util'),
//    template = [
//      '@font-face {\n',
//      '  font-family: "{{fontName}}";\n',
//      '  font-style: normal;\n',
//      '  font-weight: 400;\n',
//      '  src: local("{{fontName}}"),\n',
//      '       url("data:application/x-font-{{fontType}};base64,{{base64}}") format("{{fontType}}");\n',
//      '}'
//    ].join('');
//
//module.exports = function (list) {
//  'use strict';
//
//  var files = [],
//      transform = function (file, encoding, callback) {
//        if (file.isNull()) {
//          this.push(file);
//          return callback();
//        }
//        files.push(file);
//
//        callback();
//      },
//      flush = function (callback) {
//        files.forEach(function (file, idx) {
//          var output = file;
//          var regexResult = file.path.match(/([^\\\/]+)\.(woff|woff2)$/);
//
//          if (regexResult) {
//            var fileName = regexResult[1],
//                fontType = regexResult[2],
//                fontName = fileName.replace(/_/g, ' '),
//                base64 = file.contents.toString('base64'),
//                tmpl = template
//                  .replace(/{{fontName}}/g, fontName)
//                  .replace(/{{fontType}}/g, fontType)
//                  .replace('{{base64}}', base64),
//
//                path = gutil.replaceExtension(file.path, ['', fontType, 'css'].join('.'));
//
//            output = new gutil.File({
//              cwd: file.cwd,
//              base: file.base,
//              path: path
//            });
//
//            output.contents = new Buffer(tmpl);
//          }
//          this.push(output);
//        }.bind(this));
//
//        callback();
//      };
//
//  return through2.obj(transform, flush);
//
//};
