/**
 * Must have crunchme binary in the same folder!
 */

const eventstream = require('event-stream');
const { execSync } = require('child_process');
const fs = require('fs');

const tempFile = '.\\build\\temp.js';

const cruncher = function() {
  const binary = '.\\lib\\crunchme-win32.exe';
  const inputPath = tempFile;
  const outputPath = '.\\build\\index.js';

  execSync(`${binary} -latin1 ${inputPath} ${outputPath}`, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      console.error(err);
      return;
    }

    // the *entire* stdout and stderr (buffered)
    // console.log(`stdout: ${stdout}`);
    // console.log(`stderr: ${stderr}`);
  });

  return fs.readFileSync(outputPath, 'utf8');
}


module.exports = function (opt) {
  function crunchme(file) {
    if (file.isNull()) return this.emit('data', file);
    if (file.isStream()) return this.emit('error', new Error("Streaming not supported"));
    var str = file.contents.toString('utf8');

    fs.writeFileSync(tempFile, str); // I was in a hurry here so this goes through file system

    const before = str.length;
    const result = cruncher();
    const after = result.length;

    const ratio = Math.round(after / before * 100);

    if (ratio < 100) {
      console.log(`crunchme: decreased JavaScript by ${100 - ratio}% (from ${before} to ${after})`);
      file.contents = new Buffer.from(result);
    } else {
      console.error(`crunchme: unable to shrink JavaScript, increased to ${ratio}%`)
      file.contents = new Buffer.from(str);
    }

    this.emit('data', file);
  }

  return eventstream.through(crunchme);
};