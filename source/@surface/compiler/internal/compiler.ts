/* eslint-disable @typescript-eslint/indent */
import chalk            from "chalk";
import webpack          from "webpack";
import WebpackDevServer from "webpack-dev-server";
import
{
    createAnalyzerConfiguration,
    createBuildConfiguration,
    createDevServerConfiguration,
    createExportConfiguration,
} from "./common";
import AnalyzerOptions  from "./types/analyzer-options";
import BuildOptions     from "./types/build-options";
import Configuration    from "./types/configuration";
import DevServerOptions from "./types/dev-serve-options";
import ExportOptions    from "./types/export-options";

const DEFAULT_STATS_OPTIONS: webpack.Stats.ToStringOptions =
{
    assets:   true,
    colors:   true,
    errors:   true,
    version:  true,
    warnings: true,
};

export default class Compiler
{
    private static run(options: BuildOptions, webpackConfiguration: webpack.Configuration): void
    {
        const
        {
            logLevel: statOptions = DEFAULT_STATS_OPTIONS,
            mode                  = "development",
            watch                 = false,
        } = options;

        const webpackCompiler = webpack(webpackConfiguration);

        const handler: webpack.Compiler.Handler =
            (error, stats) => error ? console.log(error.message) : console.log(stats.toString(statOptions));

        console.log(`Starting ${chalk.bold.green(watch ? "Watch" : "Build")} using ${chalk.bold.green(mode)} configuration.`);

        if (watch)
        {
            webpackCompiler.watch({ }, handler);
        }
        else
        {
            webpackCompiler.run(handler);
        }
    }

    public static analyze(options: AnalyzerOptions, configuration: Configuration): void
    {
        const webpackConfiguration = createAnalyzerConfiguration(options, configuration);

        Compiler.run({ mode: options.mode }, webpackConfiguration);
    }

    public static build(options: BuildOptions, configuration: Configuration = { }): void
    {
        const webpackConfiguration = createBuildConfiguration(options, configuration);

        Compiler.run(options, webpackConfiguration);
    }

    public static export(options: ExportOptions, configuration: Configuration = { }): void
    {
        const webpackConfiguration = createExportConfiguration(options, configuration);

        Compiler.run(options, webpackConfiguration);
    }

    public static serve(options: DevServerOptions, configuration: Configuration = { }): void
    {
        const
        {
            host                  = "localhost",
            logLevel: statOptions = DEFAULT_STATS_OPTIONS,
            port                  = 8080,
        } = options;

        const webpackConfiguration = createDevServerConfiguration(options, configuration);
        const webpackCompiler      = webpack(webpackConfiguration);

        const publicPath = configuration.publicPath
            ? (configuration.publicPath.startsWith("/") ? "" : "/") + configuration.publicPath.replace(/\/$/, "")
            : "";

        const webpackDevServerConfiguration: WebpackDevServer.Configuration =
        {
            historyApiFallback: { index: `${publicPath}/index.html` },
            hot:                options.hot,
            inline:             true,
            publicPath,
            stats:              statOptions,
            ...configuration.devServer,
        };

        const server = new WebpackDevServer(webpackCompiler, webpackDevServerConfiguration);

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

                console.log(`WebpackDevServer listening at ${host}:`, port);
            },
        );
    }
}