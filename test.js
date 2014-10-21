'use strict';

var fs = require('fs');

var execSeries = require('./');
var isAppveyor = require('is-appveyor');
var rimraf = require('rimraf');
var test = require('tape');

test('execSeries()', function(t) {
  t.plan(14);

  execSeries(['mkdir tmp']);
  setTimeout(function() {
    fs.exists('tmp', function(result) {
      t.ok(result, 'should run the command even if the callback is not specified.');
      rimraf.sync('tmp');
    });
  }, isAppveyor ? /* istanbul ignore next */ 3000 : 120);

  execSeries(['node -e "console.log(1)"'], function(err, stdout, stderr) {
    t.strictEqual(err, undefined, 'should not fail when a command doesn\'t fail.');
    t.deepEqual(stdout, ['1\n'], 'should create an array of the stdout string.');
    t.deepEqual(stderr, [''], 'should create an array of the stderr string.');
  });

  execSeries([
    'node -e "console.log(1)"',
    'node -e "console.log(2); console.warn(1);"'
  ], function(err, stdout, stderr) {
    t.strictEqual(err, undefined, 'should not fail when every command doesn\'t fail.');
    t.deepEqual(stdout, ['1\n', '2\n'], 'should create an array of the multiple stdout strings.');
    t.deepEqual(stderr, ['', '1\n'], 'should create an array of the multiple stderr strings.');
  });

  execSeries([
    'node -e "console.log(1)"',
    'unknown-command',
    'node -e "console.log(3)"'
  ], function(err, stdout, stderr) {
    t.notEqual(
      err.code, 0,
      'should pass an error to the callback when one of the commands fails.'
    );
    t.deepEqual(stdout, ['1\n', ''], 'should not include stdout strings after error');
    t.equal(stderr.length, 2, 'should not include stderr strings after error');
    t.ok(stderr[1].length > 0, 'should reflect stderr of the failed command.');
  });

  execSeries(['node -e "console.log(1)"'], {encoding: 'base64'}, function(err, stdout) {
    t.strictEqual(err, undefined, 'should accept `exec` options.');
    t.deepEqual(stdout, ['MQo='], 'should reflect `exec` options to the output.');
  });

  t.throws(
    execSeries.bind(null, 'node -v'),
    'should throw a type error when its first argument is not an array.'
  );
});
