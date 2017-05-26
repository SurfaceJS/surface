"use strict";
module.exports = (path) => {
    let configuration = require(path);
    let config = {
        devtool: "#source-map",
        context: configuration.context,
        entry: configuration.entry,
        output: {
            path: configuration.public,
            publicPath: configuration.publicPath,
            filename: configuration.filename,
            libraryTarget: configuration.libraryTarget
        },
        resolve: {
            extensions: [".ts", ".js"],
            modules: configuration.modules
        },
        module: {
            rules: [
                {
                    test: /\.(png|jpe?g|svg)$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: { name: "/resources/[hash].[ext]" }
                        }
                    ]
                },
                {
                    test: /\.s[ac]ss$/,
                    use: [
                        { loader: "to-string-loader" },
                        { loader: "css-loader" },
                        { loader: "sass-loader" }
                    ]
                },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: "html-loader",
                            options: {
                                attrs: ["img:src", "link:href", "script:src"],
                                minify: true
                            }
                        }
                    ]
                },
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                compilerOptions: {
                                    target: configuration.target
                                }
                            },
                        }
                    ]
                },
            ],
        }
    };
    return config;
};
//# sourceMappingURL=webpack.config.js.map