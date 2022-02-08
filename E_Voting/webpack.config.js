const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjector = require('html-webpack-injector');
const Dotenv = require('dotenv-webpack');
const webpack = require("webpack")

let template = ['adminElection/', 'adminElection/', 'adminElection/', 'profile/', 'userElection/', 'userElection/', 'electionResult/', 'electionResult/']
let count = -1
let files = ['create', 'list', 'edit', 'profile', 'elections', 'candidates', 'resultList', 'result'];
let multipleHtmlPlugins = files.map(name => {
    count++
    return new HtmlWebpackPlugin({
        template: `./src/${template[count]}${name}.html`, // relative path to the HTML files
        filename: `${name}.html`, // output HTML files
        chunks: [`${name}_head`],  // respective JS files
        HTML_PATH: './src/commonHTML/'
    })

});
module.exports = {
    mode: 'development',
    entry: {
        create_head: "./src/adminElection/js/create.js",
        list_head: "./src/adminElection/js/list.js",
        edit_head: "./src/adminElection/js/edit.js",
        index_head: "./src/index.js",
        profile_head: "./src/profile/js/profile.js",
        elections_head: "./src/userElection/js/elections.js",
        candidates_head: "./src/userElection/js/candidates.js",
        resultList_head: "./src/electionResult/js/resultList.js",
        result_head: "./src/electionResult/js/result.js",
    },
    // resolve: {
    //     alias: {
    //         'try': './src/js'
    //     }
    // },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html",
            chunks: ['index_head'],
            HTML_PATH: './src/commonHTML/'
        }),
        // global import in every js file
        new webpack.ProvidePlugin({
            '$': 'jQuery',
            'solidity': '../../global.js',
            'votersJSON': "../build/contracts/Voters.json",
            "electionsJSON": "../build/contracts/Elections.json"
        }),
        new CopyWebpackPlugin([
            { from: "./src/img/success.png", to: "success.png" },
            { from: "./src/img/fail.png", to: "fail.png" },
            { from: "./src/adminElection/createForm.html", to: "createForm.html" },
            { from: "./src/userElection/candidate.html", to: "candidate.html" },
            { from: "./src/commonHTML/election.html", to: "election.html" },

        ]),
        new HtmlWebpackInjector()

    ].concat(multipleHtmlPlugins),
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
