#!/usr/bin/node
const fs = require('fs');
const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./out.log', 'a');

const cp = require('child_process');
const child = cp.spawn('node', ['generation/webserver.js'], { detached: true, stdio: [ 'ignore', out, err ] });
child.unref();

