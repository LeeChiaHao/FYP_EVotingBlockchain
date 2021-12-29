const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: "./src/js/app.js",
    output: {
        filename: "app.js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: "./src/index.html", to: "index.html" },
            { from: "./build/contracts/User.json", to: "User.json" }
        ]),
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
            }
        ]
    }
};
