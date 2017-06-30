
import Webpack = require("webpack");
import config  = require("./webpack-config");

export = function (configPath?: string, env?: string, watch?: boolean)
{
    if (configPath && configPath.endsWith("/"))    
        configPath = `${configPath}surface.config.json`;
    else
        configPath = "./surface.config.json";

    env   = env || "dev";
    watch = !!watch;

    let compiler = Webpack(config(configPath));

    let statOptions: Webpack.Stats.ToStringOptions =
    {
        assets:   true,
        version:  true,
        colors:   true,
        warnings: true,
        errors:   true
    };

    let callback: Webpack.Compiler.Handler =
        (error, stats) => error ? console.log(error.message) : console.log(stats.toString(statOptions));

    console.log(`Starting ${watch ? "Watch" : "build"} using ${env} configuration.`);

    if (watch)
        compiler.watch({aggregateTimeout: 500, poll: true, ignored: /node_modules/ }, callback);
    else
        compiler.run(callback);
}
