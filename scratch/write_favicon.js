const fs = require('fs');
const path = require('path');

const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const buffer = Buffer.from(base64Png, 'base64');

fs.writeFileSync('c:/Users/hudav/Documents/GitHub/app/public/favicon.ico', buffer);
console.log('Successfully wrote 1x1 transparent PNG as favicon.ico');
