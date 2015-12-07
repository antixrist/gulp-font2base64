var through = require('through2'),
    extend  = require('extend'),
    _       = require('lodash'),
    gutil   = require('gulp-util'),
    path    = require('path')
;

/**
 * @typedef {{}} GulpFont2Base64Opts
 * @property {string} template
 * @property {Function} map
 */

/**
 * @type {GulpFont2Base64Opts}
 */
var defaults = {
  template: [
    '@font-face {',
    '  font-family: "<%= name %>";',
    '  font-style: normal;',
    '  font-weight: 400;',
    '  src: local("<%= name %>"),',
    '       url("data:<%= mime %>;base64,<%= base64 %>") format("<%= format %>");',
    '}'
  ].join('\n'),
  map: function () {}
};

/**
 * @param {GulpFont2Base64Opts} [opts]
 */
module.exports = function(opts) {
  opts = _.isPlainObject(opts) ? opts : {};
  opts = extend({}, defaults, opts);

  var tpl = _.template(opts.template);
  var mapper = _.isFunction(opts.map) ? opts.map : function () {};


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
      format = (format != 'ttf') ? format : 'truetype';

      var fileName = path.basename(file.path, extName);

      var data = {
        name: fileName,
        localName: fileName,
        fontStyle: 'normal',
        fontWeight: '400',
        mime: 'application/x-font-'+ format,
        format: format,
        base64: base64
      };

      var tmp = mapper(extend({}, data));
      if (_.isPlainObject(tmp)) {
        data = extend(data, tmp);
      }

      var output = tpl(data);
      file.contents = new Buffer(output);
      //file.path = gutil.replaceExtension(file.path, '.css');
      file.path = file.path +'.css';

      return callback(null, file);
    }
  });
};
