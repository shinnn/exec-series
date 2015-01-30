'use strict';

var fs = require('fs');
var path = require('path');

var execSeries = require('./');
var rimraf = require('rimraf');
var test = require('tape');

test('execSeries()', function(t) {
  t.plan(11);

  var tmpPath = path.resolve('__this__is__a__temporary__directory__', 'foobarbazqux');

  execSeries([
    'mkdir ' + path.dirname(tmpPath),
    'mkdir ' + tmpPath
  ]);

  setTimeout(function() {
    fs.stat(tmpPath, function(err, stats) {
      t.strictEqual(err, null, 'should regard callback function as optional.');
      t.ok(stats.isDirectory(), 'should run commands.');
      rimraf.sync(path.dirname(tmpPath));
    });
  }, 120 + Number(!!process.env.CI) * 5000);

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
