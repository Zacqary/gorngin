var path = require('path');

module.exports = {
    entry: "./src/init.js",
    output: {
        path: __dirname + '/src',
        filename: "bundle.js"
    },
    module: {
        loaders: [
        ]
    },
    resolve: {
      modules:  [path.resolve(__dirname, "src"), "node_modules"],
      alias: {
        jquery     : path.resolve(__dirname, 'node_modules/jquery/dist/jquery.min'),
        gorngin    : path.resolve(__dirname, 'src/gorngin'),
        states     : path.resolve(__dirname, 'src/states'),
      }
    }
};
