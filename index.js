var through = require('through2'),
    extend  = require('extend'),
    _       = require('lodash'),
    gutil   = require('gulp-util'),
    path    = require('path')
;

/**
 * @typedef {{}} GulpFont2Base64Opts
 * @property {string} template
 * @property {GulpFont2Base64OptsMapper} map
 */

/**
 * @callback GulpFont2Base64OptsMapper
 * @param {GulpFont2Base64FontData} data
 * @returns {GulpFont2Base64FontData}
 */

/**
 * @typedef {{}} GulpFont2Base64FontData
 * @property {string} fontFamily Value for css-property 'font-family'. Default: file basename
 * @property {string} fontStyle Value for css-property 'font-style'. Default 'normal',
 * @property {string} fontWeight Value for css-property 'font-weight'. Default '400',
 * @property {string} local It's a user's local font name. Value for css-property 'src: local(<...>)'. Default: file basename
 * @property {string} format Similar to extname. If extname is 'ttf' then format will be equal to 'truetype'
 * @property {string} mime Default: 'application/x-font-'+ format
 * @property {string} base64 Base64 string of font content
 */


/**
 * @type {GulpFont2Base64Opts}
 */
var defaults = {
  map: function (data) {},
  template: [
    '@font-face {',
    '  <% if (fontFamily) { %>font-family: "<%= fontFamily %>";<% } %>',
    '  <% if (fontStyle) { %>font-style: <%= fontStyle %>;<% } %>',
    '  <% if (fontWeight) { %>font-weight: <%= fontWeight %>;<% } %>',
    '  src: <% if (local) { %>local("<%= local %>"),<% } %>',
    '       url("data:<%= mime %>;base64,<%= base64 %>") format("<%= format %>");',
    '}'
  ].join('\n')
};

/**
 * @param {GulpFont2Base64Opts} [opts]
 */
module.exports = function (opts) {
  opts = _.isPlainObject(opts) ? opts : {};
  opts = extend({}, defaults, opts);

  var tpl = _.template(opts.template);
  /**
   * @type {GulpFont2Base64OptsMapper}
   */
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

      /**
       * @type {GulpFont2Base64FontData}
       */
      var data = {
        fontFamily: fileName,
        fontStyle: 'normal',
        fontWeight: '400',
        local: fileName,
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
