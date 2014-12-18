'use strict';

var fs = require('fs');
var path = require('path');

var execSeries = require('./');
var isAppveyor = require('is-appveyor');
var rimraf = require('rimraf');
var test = require('tape');

test('execSeries()', function(t) {
  t.plan(10);

  var waitTime = 120;
  /* istanbul ignore if */
  if (isAppveyor) {
    waitTime = 5000;
  }

  execSeries([
    'mkdir ' + path.resolve('tmp'),
    'mkdir ' + path.resolve('tmp/tmp')
  ]);
  setTimeout(function() {
    fs.exists('tmp/tmp', function(result) {
      t.ok(result, 'should run the command even if the callback is not specified.');
      rimraf.sync('tmp');
    });
  }, waitTime);

  execSeries(['node -e "console.log(1)"'], function(err, stdout, stderr) {
    t.deepEqual(
      [err, stdout, stderr],
      [null, ['1\n'], ['']],
      'should pass arrays of stdout and stderr.'
    );
  });

  execSeries([
    'node -e "console.log(1)"',
    'node -e "console.log(2); console.warn(1);"'
  ], function(err, stdout, stderr) {
    t.deepEqual(
      [err, stdout, stderr],
      [null, ['1\n', '2\n'], ['', '1\n']],
      'should pass arrays of multiple stdout and stderr.'
    );
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
    t.deepEqual(
      [err, stdout],
      [null, [new Buffer('1\n').toString('base64')]],
      'should reflect `exec`\'s options to the output.'
    );
  });

  t.throws(
    execSeries.bind(null, 'node -v'),
    /TypeError.*not an array/,
    'should throw a type error when its first argument is not an array.'
  );

  t.throws(
    execSeries.bind(null, ['node -v'], {}, 'function'),
    /TypeError.*must be a function/,
    'should throw a type error when its third argument is specified but not a function.'
  );
});
