module.exports = {
    entry: './views/index.jsx',
    output: {
        path: './static/',
        filename: 'bundle.js', 
    },
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                exclude: /node_modules/, 
                loader: "babel", 
                query:
                {
                    presets:['react']
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
        extensions: ['', '.js', '.jsx', '.css']
    }
}