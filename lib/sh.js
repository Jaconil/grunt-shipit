/**
 * Module dependencies.
 */

var childProcess = require('child_process');
var utils = require('./utils');

/**
 * Expose functions.
 */

exports.spawn = spawn;
exports.run = run;

/**
 * Spawn a new command.
 *
 * @param {String} command
 * @param {String[]} args
 * @return {ChildProcessObject}
 */

function spawn(command, args) {
  args = args || [];
  console.log('=> %s', command + ' ' + args.join(' '));
  return childProcess.spawn(command, args);
}

/**
 * Run a new command.
 *
 * @param {String} command
 * @param {Function} callback
 * @return {connection} for chaining
 */

function run(command, callback) {
  var childProcObj = this.spawn(command);
  var stdout = '';

  console.log('Running ' + command + ' locally.');

  // Handle stderr.
  childProcObj.stderr.on('data', function (data) {
    console.error(utils.prefixLines('@ ', data.toString()));
  }.bind(this));

  // Handle stdout.
  childProcObj.stdout.on('data', function (data) {
    console.log(utils.prefixLines('@ ', data.toString()));
    stdout += data.toString();
  }.bind(this));

  // Handle close event.
  childProcObj.on('close', function (code) {
    // Return an error if code is not 0
    if (code !== 0) {
      var error = new Error('Error (exit code ' + code + ') running command ' + command +
          ' locally.');
      error.code = code;
      return callback(error);
    }

    console.log('Finished ' + command);
    callback(null, stdout);
  }.bind(this));

  return this;
}