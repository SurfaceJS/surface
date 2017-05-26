"use strict";
const Path = require("path");
module.exports = (path) => {
    let project = require(path);
    let config = {
        devtool: "#source-map",
        context: Path.resolve(process.cwd(), project.context),
        entry: project.entry,
        output: {
            path: Path.resolve(process.cwd(), project.public),
            publicPath: project.publicPath,
            filename: project.filename,
            libraryTarget: project.libraryTarget
        },
        resolve: {
            extensions: [".ts", ".js"],
            modules: project.modules
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
                                    target: project.target
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
//# sourceMappingURL=webpack-config.js.map