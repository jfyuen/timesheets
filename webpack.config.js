module.exports = {
    entry: ['whatwg-fetch', './views/index.jsx'],
    output: {
        path: __dirname + '/static/',
        filename: 'bundle.js', 
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: /node_modules/, 
                loader: "babel-loader", 
                query:
                {
                    presets: ['@babel/preset-env', '@babel/preset-react']
                }
            },
            { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    },
    externals: {
        //don't bundle the 'react' npm package with our bundle.js
        //but get it from a global 'React' variable
        // 'react': 'React'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    }
}