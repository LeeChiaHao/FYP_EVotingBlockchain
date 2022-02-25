const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjector = require('html-webpack-injector');
const Dotenv = require('dotenv-webpack');
const webpack = require("webpack")

let template = ['register/', 'adminElection/', 'adminElection/', 'adminElection/', 'adminElection/',
    'profile/', 'userElection/', 'userElection/', 'electionResult/',
    'electionResult/', 'voteHistory/', 'voteHistory/']
let count = -1
let files = ['register', 'create', 'list', 'edit', 'view', 'profile', 'elections',
    'candidates', 'resultList', 'results', 'historyList', 'verify'];
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
        view_head: "./src/adminElection/js/view.js",
        index_head: "./src/index.js",
        register_head: "./src/register/js/register.js",
        profile_head: "./src/profile/js/profile.js",
        elections_head: "./src/userElection/js/elections.js",
        candidates_head: "./src/userElection/js/candidates.js",
        resultList_head: "./src/electionResult/js/resultList.js",
        results_head: "./src/electionResult/js/results.js",
        historyList_head: "./src/voteHistory/js/historyList.js",
        verify_head: "./src/voteHistory/js/verify.js"
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
            { from: "./src/img/male.png", to: "male.png" },
            { from: "./src/img/female.png", to: "female.png" },
            { from: "./src/img/logo.png", to: "logo.png" },
            { from: "./src/adminElection/createForm.html", to: "createForm.html" },
            { from: "./src/userElection/candidate.html", to: "candidate.html" },
            { from: "./src/commonHTML/election.html", to: "election.html" },
            { from: "./src/commonHTML/result.html", to: "result.html" },
            { from: "./src/voteHistory/history.html", to: "history.html" },
            { from: "./src/adminElection/subView.html", to: "subView.html" },
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
