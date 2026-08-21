const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'src', 'presentation', 'index.html');
const destination = path.join(__dirname, '..', 'dist', 'presentation', 'index.html');
const rendererSource = path.join(__dirname, '..', 'src', 'presentation', 'renderer.js');
const rendererDestination = path.join(__dirname, '..', 'dist', 'presentation', 'renderer.js');

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);
if (fs.existsSync(rendererSource)) fs.copyFileSync(rendererSource, rendererDestination);
