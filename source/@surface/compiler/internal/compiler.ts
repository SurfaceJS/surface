/* eslint-disable @typescript-eslint/indent */
import { Delegate } from "@surface/core";
import chalk        from "chalk";
import { log }      from "./common";
import
{
    createAnalyzerConfiguration,
    createBuildConfiguration,
    createDevServerConfiguration,
} from "./configurations";
import { WebpackDevServer, webpack } from "./external";
import AnalyzerOptions               from "./types/analyzer-options";
import BuildOptions                  from "./types/build-options";
import CompilerSignal                from "./types/compiler-signal";
import Configuration                 from "./types/configuration";
import DevServerOptions              from "./types/dev-serve-options";

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
    private static createHandler(resolve: Delegate, reject: Delegate<[Error]>, statOptions: webpack.Stats.ToStringOptions): webpack.Compiler.Handler
    {
        return (error, stats) => error ? reject(error) : (log(stats.toString(statOptions)), resolve());
    }

    private static async runInternal(webpackConfiguration: webpack.Configuration, statOptions: webpack.Stats.ToStringOptions = DEFAULT_STATS_OPTIONS): Promise<void>
    {
        const webpackCompiler = webpack(webpackConfiguration);

        await new Promise<string>((resolve, reject) => webpackCompiler.run(Compiler.createHandler(resolve, reject, statOptions)));
    }

    private static async watchInternal(webpackConfiguration: webpack.Configuration, statOptions: webpack.Stats.ToStringOptions = DEFAULT_STATS_OPTIONS): Promise<CompilerSignal>
    {
        const webpackCompiler = webpack(webpackConfiguration);

        let watching: webpack.Compiler.Watching;

        await new Promise<string>((resolve, reject) => watching = webpackCompiler.watch({ }, Compiler.createHandler(resolve, reject, statOptions)));

        return { close: async () => new Promise(resolve => watching.close(resolve)) };
    }

    public static async analyze(configuration: Configuration, options: AnalyzerOptions): Promise<void>
    {
        const webpackConfiguration = createAnalyzerConfiguration(configuration, options);

        log(`Starting ${chalk.bold.green("analyzer...")}`);

        await Compiler.runInternal(webpackConfiguration);
    }

    public static async run(configuration: Configuration, options: BuildOptions): Promise<void>
    {
        const webpackConfiguration = createBuildConfiguration(configuration, options);

        log(`Running using ${chalk.bold.green(options.mode ?? "development")} configuration...`);

        await Compiler.runInternal(webpackConfiguration, options.logLevel);
    }

    public static async serve(configuration: Configuration, options: DevServerOptions): Promise<CompilerSignal>
    {
        const
        {
            host                  = "localhost",
            logLevel: statOptions = DEFAULT_STATS_OPTIONS,
            port                  = 8080,
        } = options;

        const webpackConfiguration = createDevServerConfiguration(configuration, options);
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

        const handlerAsync = (resolve: Delegate, reject: Delegate<[Error]>) =>
            (error?: Error) => error ? reject(error) : resolve();

        await new Promise((resolve, reject) => server.listen(port, host, handlerAsync(resolve, reject)));

        log(`WebpackDevServer listening at ${host}:`, port);

        return { close: async () => Promise.resolve(server.close()) };
    }

    public static async watch(configuration: Configuration, options: BuildOptions): Promise<CompilerSignal>
    {
        const webpackConfiguration = createBuildConfiguration(configuration, options);

        log(`Watching using ${chalk.bold.green(options.mode)} configuration.`);

        return Compiler.watchInternal(webpackConfiguration, options.logLevel);
    }
}