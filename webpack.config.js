const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './raw/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        globalObject: 'this',
        library: {
            name: 'shimi',
            type: 'umd'
        }
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: true
                }
            })
        ]
    }
};