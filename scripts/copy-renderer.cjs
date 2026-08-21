const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'src', 'presentation', 'index.html');
const destination = path.join(__dirname, '..', 'dist', 'presentation', 'index.html');

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);
