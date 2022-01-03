const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack")

// let htmlPageNames = ['profile', 'example2', 'example3', 'example4'];
// let multipleHtmlPlugins = htmlPageNames.map(name => {
//     return new HtmlWebpackPlugin({
//         template: `./src/${name}.html`, // relative path to the HTML files
//         filename: `${name}.html`, // output HTML files
//         chunks: [`${name}`] // respective JS files
//     })
// });
module.exports = {
    mode: 'development',
    entry: {
        create: "./src/create/js/create.js",
        index: "./src/index.js",
        profile: "./src/profile/js/profile.js",
    },
    // resolve: {
    //     alias: {
    //         'try': './src/js'
    //     }
    // },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/create/create.html",
            filename: "create.html",
            chunks: ['create']
        }),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html",
            chunks: ['app']
        }),
        new HtmlWebpackPlugin({
            template: "./src/profile/profile.html",
            filename: "profile.html",
            chunks: ['profile'],
            HTML_PATH: './src/commonHTML/'
        }),
        new webpack.ProvidePlugin({
            '$': 'jQuery',
            'solidity': '../../global.js',
            'userJSON': "../build/contracts/User.json"
        }),
        new CopyWebpackPlugin([
            { from: "./src/img/success.png", to: "success.png" },
            { from: "./src/create/candidate.html", to: "candidate.html" }
        ])

    ],
    devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    }
                ]
            },
        ]
    }
};
