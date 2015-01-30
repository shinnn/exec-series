# exec-series

[![NPM version](https://img.shields.io/npm/v/exec-series.svg?style=flat)](https://www.npmjs.com/package/exec-series)
[![Build Status](https://img.shields.io/travis/shinnn/exec-series.svg?style=flat)](https://travis-ci.org/shinnn/exec-series)
[![Build status](https://ci.appveyor.com/api/projects/status/bi4pflltlq5368ym?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/exec-series)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/exec-series.svg?style=flat)](https://coveralls.io/r/shinnn/exec-series)
[![Dependency Status](https://img.shields.io/david/shinnn/exec-series.svg?style=flat&label=deps)](https://david-dm.org/shinnn/exec-series)
[![devDependency Status](https://img.shields.io/david/dev/shinnn/exec-series.svg?style=flat&label=devDeps)](https://david-dm.org/shinnn/exec-series#info=devDependencies)

A [Node](http://nodejs.org/) module to run commands in order

```javascript
var execSeries = require('exec-series');

execSeries(['echo "foo"', 'echo "bar"'], function(err, stdouts, stderrs) {
  if (err) {
    throw err;
  }

  console.log(stdouts); // yields: ['foo\n', 'bar\n']
  console.log(stderrs); // yields: ['', '']
});
```

On Linux, you can do almost the same thing with [`&&`](http://tldp.org/LDP/abs/html/list-cons.html#LISTCONSREF) operator like below:

```javascript
var exec = require('child_process').exec;

exec('echo "foo" && echo "bar"', function(err, stdout, stderr) {
  //...
});
```

However, some environments, such as [Windows PowerShell](https://connect.microsoft.com/PowerShell/feedback/details/778798/implement-the-and-operators-that-bash-has), don't support `&&` operator. This module helps you to [create a cross-platform Node program](https://gist.github.com/domenic/2790533).

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install exec-series
```

## API

```javascript
var execSeries = require('exec-series');
```

### execSeries(*commands* [, *options*, *callback*])

*commands*: `Array` of `String` (the commands to run)  
*options*: `Object` ([child_process.exec][exec] options)  
*callback*: `Function`

It sequentially runs the commands using [child_process.exec][exec]. If the first command has finished successfully, the second command will run, and so on.

After the last command has finished, it runs the callback function.

When one of the commands fails, it immediately calls the callback function and the rest of the commands won't be run.

#### callback(*error*, *stdoutArray*, *stderrArray*)

*error*: `Error` if one of the commands fails, otherwise `undefined`  
*stdoutArray*: `Array` of `String` (stdout of the commands)  
*stderrArray*: `Array` of `String` (stderr of the commands)

```javascript
execSeries([
  'mkdir foo',
  'echo bar',
  'exit 200',
  'mkdir baz'
], function(err, stdouts, stderrs) {
  err.code; //=> 200
  stdouts; //=> ['', 'bar\n', '']
  stderrs; //=> ['', '', '']
  
  fs.existsSync('foo'); //=> true
  fs.existsSync('baz'); //=> false
});
```

Callback function is optional.

```javascript
execSeries(['mkdir foo', 'mkdir bar']);

setTimeout(function() {
  fs.existsSync('foo'); //=> true
  fs.existsSync('bar'); //=> true
}, 1000);
```

## License

Copyright (c) 2014 - 2015 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).

[exec]: http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
