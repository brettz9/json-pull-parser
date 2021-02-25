#!/usr/bin/env node
'use strict';

const JSONPullParser = require('../');

let content = '';
process.stdin.resume();
process.stdin.on('data', (data) => {
  content += data.toString();
});

// eslint-disable-next-line no-console -- CLI
process.stdin.on('end', () => console.log(JSONPullParser.parse(content)));
