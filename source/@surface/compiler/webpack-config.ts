import Webpack = require("webpack");
import Path    = require("path");

export = (path: string) =>
{   
    let defaults     = require(Path.resolve(__dirname, "./surface.config.json"));
    let customConfig = require(Path.resolve(process.cwd(), path));
    
    customConfig = Object.assign(defaults, customConfig);

    let config =
    {
        devtool: "#source-map",
        context: Path.resolve(process.cwd(), customConfig.context),
        entry:   customConfig.entry,
        output:
        {
            path:          Path.resolve(process.cwd(), customConfig.public),
            publicPath:    customConfig.publicPath,
            filename:      customConfig.filename,
            libraryTarget: customConfig.libraryTarget
        } as Webpack.Output,
        resolve:
        {            
            extensions: [".ts", ".js"],
            modules:
            [
                Path.resolve(__dirname, "./node_modules")
            ].concat(customConfig.modules.map(x => Path.resolve(process.cwd(), x)))
        } as Webpack.Resolve,
        resolveLoader:
        {
            modules:
            [
                Path.resolve(__dirname, "./node_modules")
            ]
        } as Webpack.ResolveLoader,
        module:
        {
            rules:
            [
                {
                    test: /\.(png|jpe?g|svg)$/,
                    use:
                    [
                        {
                            loader: "file-loader",
                            options: { name: "/resources/[hash].[ext]" }
                        }
                    ]
                },
                {
                    test: /\.s[ac]ss$/,
                    use:
                    [
                        { loader: "to-string-loader" },
                        { loader: "css-loader" },
                        { loader: "sass-loader" }
                    ]
                },
                {
                    test: /\.html$/,
                    use:
                    [
                        {   
                            loader: "html-loader",
                            options:
                            {
                                attrs: ["img:src", "link:href", "script:src"],
                                minify: true
                            }
                        }
                    ]
                },
                {
                    test: /\.ts$/,
                    use:
                    [
                        {
                            loader: "ts-loader",
                            options:
                            {
                                compilerOptions:
                                {
                                    noEmit: false,
                                    target: "es6"
                                }
                            },
                        }
                    ]
                },
            ] as Array<Webpack.Rule>,
        } as Webpack.Module
    } as Webpack.Configuration;

    return config;
}