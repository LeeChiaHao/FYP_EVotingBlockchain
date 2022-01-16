const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjector = require('html-webpack-injector');
const Dotenv = require('dotenv-webpack');
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
        create_head: "./src/adminElection/js/create.js",
        list_head: "./src/adminElection/js/list.js",
        edit_head: "./src/adminElection/js/edit.js",
        index_head: "./src/index.js",
        profile_head: "./src/profile/js/profile.js",
        elections_head: "./src/userElection/js/elections.js",
        candidates_head: "./src/userElection/js/candidates.js"
    },
    // resolve: {
    //     alias: {
    //         'try': './src/js'
    //     }
    // },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            template: "./src/adminElection/create.html",
            filename: "create.html",
            chunks: ['create_head'],
            HTML_PATH: './src/commonHTML/'
        }),
        new HtmlWebpackPlugin({
            template: "./src/adminElection/list.html",
            filename: "list.html",
            chunks: ['list_head'],
            HTML_PATH: './src/commonHTML/'
        }),
        new HtmlWebpackPlugin({
            template: "./src/adminElection/edit.html",
            filename: "edit.html",
            chunks: ['edit_head'],
            HTML_PATH: './src/commonHTML/'
        }),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html",
            chunks: ['index_head'],
            HTML_PATH: './src/commonHTML/'
        }),
        new HtmlWebpackPlugin({
            template: "./src/profile/profile.html",
            filename: "profile.html",
            chunks: ['profile_head'],
            HTML_PATH: './src/commonHTML/'
        }),
        new HtmlWebpackPlugin({
            template: "./src/userElection/elections.html",
            filename: "elections.html",
            chunks: ['elections_head'],
            HTML_PATH: './src/commonHTML/'
        }),
        new HtmlWebpackPlugin({
            template: "./src/userElection/candidates.html",
            filename: "candidates.html",
            chunks: ['candidates_head'],
            HTML_PATH: './src/commonHTML/'
        }),
        // global import in every js file
        new webpack.ProvidePlugin({
            '$': 'jQuery',
            'solidity': '../../global.js',
            'userJSON': "../build/contracts/User.json",
            "electionJSON": "../build/contracts/Election.json"
        }),
        new CopyWebpackPlugin([
            { from: "./src/img/success.png", to: "success.png" },
            { from: "./src/img/fail.png", to: "fail.png" },
            { from: "./src/adminElection/createForm.html", to: "createForm.html" },
            { from: "./src/userElection/candidate.html", to: "candidate.html" },
            { from: "./src/commonHTML/election.html", to: "election.html" },

        ]),
        new HtmlWebpackInjector()

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
