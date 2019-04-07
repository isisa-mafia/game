const path = require('path');

module.exports = {
    entry: { main: './wwwroot/src/js/index.js' },
    output: {
        path: path.resolve(__dirname, './wwwroot/dist'),
        filename: 'bundle.js',
        publicPath: 'dist/'
    },

    module: {
        rules: [
            {
                test: /\.(js|jsx)/,
                exclude: /node_modules/,
                include: path.resolve(__dirname, './wwwroot/src/js'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        "presets": ["@babel/preset-env", "@babel/preset-react"]
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.css']
    }
}