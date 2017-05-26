module.exports = {
    entry: "./src/init.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        loaders: [
        ]
    },
    resolve: {
      alias: {
        states     : 'src/states',
        gorngin    : 'src/gorngin',
        jquery     : 'node_modules/jquery/dist/jquery.min'
      },
      modulesDirectories: ['node_modules']
    }
};
