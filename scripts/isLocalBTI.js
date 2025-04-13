#!/usr/bin/env node

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const btiValue = packageJson.dependencies && packageJson.dependencies['backing-tracks-isomorphic'];

if (typeof btiValue === 'string' && btiValue.startsWith('file:')) {
    process.exit(0);
} else {
    process.exit(1);
}
