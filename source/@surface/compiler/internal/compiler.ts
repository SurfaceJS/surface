import chalk                  from "chalk";
import webpack                from "webpack";
import WebpackDevServer       from "webpack-dev-server";
import { buildConfiguration } from "./common";
import EnviromentType         from "./enums/enviroment-type";
import IConfiguration         from "./types/configuration";

export default class Compiler
{
    public constructor(private readonly $webpack = webpack)
    { }

    public build(watch: boolean = false, enviroment: EnviromentType = EnviromentType.Development, configuration: IConfiguration = { }): void
    {
        const statOptions: webpack.Stats.ToStringOptions = configuration.logLevel
        ?? {
            assets:   true,
            colors:   true,
            errors:   true,
            version:  true,
            warnings: true,
        };

        const webpackConfiguration = buildConfiguration(enviroment, configuration);
        const webpackCompiler      = this.$webpack(webpackConfiguration);

        const callback: webpack.Compiler.Handler =
            (error, stats) => error ? console.log(error.message) : console.log(stats.toString(statOptions));

        console.log(`Starting ${chalk.bold.green(watch ? "Watch" : "Build")} using ${chalk.bold.green(enviroment)} configuration.`);

        if (watch)
        {
            webpackCompiler.watch({ }, callback);
        }
        else
        {
            webpackCompiler.run(callback);
        }
    }

    public serve(host: string = "localhost", port: number = 8080, configuration: IConfiguration = { }): void
    {
        const statOptions: webpack.Stats.ToStringOptions = configuration.logLevel
        ?? {
            assets:   true,
            colors:   true,
            errors:   true,
            version:  true,
            warnings: true,
        };

        const webpackConfiguration = buildConfiguration(EnviromentType.Development, configuration, { host, port });
        const webpackCompiler      = this.$webpack(webpackConfiguration);

        const publicPath =  configuration.publicPath
            ? (configuration.publicPath.startsWith("/") ? "" : "/") + configuration.publicPath.replace(/\/$/, "")
            : "";

        const options: WebpackDevServer.Configuration =
        {
            historyApiFallback: { index: `${publicPath}/index.html` },
            hot:                configuration.hot,
            inline:             true,
            publicPath,
            stats:              statOptions,
            ...configuration.devServer,
        };

        const server = new WebpackDevServer(webpackCompiler, options);

        server.listen
        (
            port,
            host,
            (err) =>
            {
                if (err)
                {
                    console.log(err);
                }

                console.log("WebpackDevServer listening at localhost:", port);
            },
        );
    }
}