const path = require('path');

module.exports = {
    entry: './raw/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: {
            name: 'shimi',
            type: 'umd'
        }
    }
};