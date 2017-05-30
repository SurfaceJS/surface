import Webpack = require("webpack");
import Path    = require("path");

//import devConfig  = require("./development");
//import prodConfig = require("./production");

//import InjectViewPlugin = require("../../source/@surface/plugins/inject-view-plugin");

export = (path: string) =>
{
    //const DEV          = "DEV";
    //const ROOT         = Path.resolve(__dirname, "../../");
    //const SOURCE       = Path.resolve(ROOT, "./source");
    //const NODE_MODULES = Path.resolve(ROOT, "./node_modules");
    //const SERVER       = Path.resolve(ROOT, "../App.Server/public");
    
    let project = require(path);

    let config = 
    {
        devtool: "#source-map",
        context: Path.resolve(process.cwd(), project.context),
        entry:   project.entry,
        output:
        {
            path:          Path.resolve(process.cwd(), project.public),
            publicPath:    project.publicPath,
            filename:      project.filename,
            libraryTarget: project.libraryTarget
        } as Webpack.Output,
        resolve:
        {            
            extensions: [".ts", ".js"],
            //modules:
            //[
            //    Path.resolve(__dirname, "../node_modules")
            //]//.concat(project.modules.map(x => Path.resolve(process.cwd(), x)))
        } as Webpack.Resolve,
        resolveLoader:
        {
            modules:
            [
                Path.resolve(__dirname, "../node_modules")
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

    //let envConfig = env == DEV ? devConfig : prodConfig;

    //envConfig.plugins = envConfig.plugins || [];
    //envConfig.plugins.push(new InjectViewPlugin({ useHash: true, views: ["app-main"] }));
    //envConfig.plugins.push(new Webpack.IgnorePlugin(/vertx/));

    //return Object.assign
    //(
    //    config,
    //    envConfig
    //) as Webpack.Configuration;

    return config;
}