/*!
 * exec-series | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/exec-series
*/

'use strict';

var exec = require('child_process').exec;

var eachSeries = require('async-each-series');

module.exports = function execSeries(commands, options, cb) {
  if (!Array.isArray(commands)) {
    throw new TypeError(commands + ' is not an array.');
  }

  if (cb === undefined) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
  }
  cb = cb || function() {};

  var stdouts = [];
  var stderrs = [];

  eachSeries(commands, function(command, next) {
    exec(command, options, function(err, stdout, stderr) {
      stdouts.push(stdout);
      stderrs.push(stderr);
      next(err);
    });
  }, function(err) {
    cb(err, stdouts, stderrs);
  });
};
