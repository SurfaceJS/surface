/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/indent */
import { URL }                         from "url";
import type { Delegate }               from "@surface/core";
import { joinPaths }                   from "@surface/core";
import chalk                           from "chalk";
import webpack                         from "webpack";
import WebpackDevServer                from "webpack-dev-server";
import { createOnlyDefinedProxy, log } from "./common.js";
import
{
    createAnalyzerConfiguration,
    createBuildConfiguration,
    createDevServerConfiguration,
} from "./configurations.js";
import type AnalyzerOptions  from "./types/analyzer-options";
import type BuildOptions     from "./types/build-options";
import type CompilerSignal   from "./types/compiler-signal";
import type Configuration    from "./types/configuration";
import type DevServerOptions from "./types/dev-serve-options";

const DEFAULT_STATS_OPTIONS =
{
    assets:   true,
    colors:   true,
    errors:   true,
    version:  true,
    warnings: true,
};

type WebpackOverload = (options: webpack.Configuration | webpack.Configuration[]) => webpack.Compiler | webpack.MultiCompiler;
type StatOptions     = string | boolean | object;

export default class Compiler
{
    private static createHandler(resolve: Delegate, reject: Delegate<[Error]>, statOptions: StatOptions): (err?: Error, result?: webpack.Stats | any) => unknown
    {
        return (error, stats) => error ? reject(error) : (log(stats?.toString(statOptions)), resolve());
    }

    private static async runInternal(webpackConfiguration: webpack.Configuration | webpack.Configuration[], statOptions: StatOptions = DEFAULT_STATS_OPTIONS): Promise<void>
    {
        const webpackCompiler = (webpack as WebpackOverload)(webpackConfiguration);

        await new Promise<void>((resolve, reject) => webpackCompiler.run(Compiler.createHandler(resolve, reject, statOptions)));
    }

    private static async watchInternal(webpackConfiguration: webpack.Configuration | webpack.Configuration[], statOptions: StatOptions = DEFAULT_STATS_OPTIONS): Promise<CompilerSignal>
    {
        const webpackCompiler = (webpack as WebpackOverload)(webpackConfiguration);

        let watching: ReturnType<webpack.Compiler["watch"] | webpack.MultiCompiler["watch"]>;

        await new Promise<void>((resolve, reject) => watching = webpackCompiler.watch({ }, Compiler.createHandler(resolve, reject, statOptions)));

        return { close: async () => new Promise<void>((resolve, reject) => watching.close(error => error ? reject(error) : resolve())) };
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
            host                  = "http://localhost",
            logLevel: statOptions = DEFAULT_STATS_OPTIONS,
            port                  = 8080,
        } = options;

        const url = new URL(host);

        url.port     = port.toString();
        url.pathname = configuration.publicPath ?? "/";

        const webpackConfiguration = createDevServerConfiguration(configuration, url);
        const webpackCompiler      = (webpack as WebpackOverload)(webpackConfiguration);

        const webpackDevServerConfiguration: WebpackDevServer.Configuration = createOnlyDefinedProxy
        ({
            historyApiFallback: { index: joinPaths(url.pathname, "index.html") },
            host:               url.hostname,
            hot:                options.hot,
            inline:             true,
            port,
            publicPath:         url.pathname,
            stats:              statOptions,
            ...configuration.devServer,
        });

        const server = new WebpackDevServer(webpackCompiler, webpackDevServerConfiguration);

        const handlerAsync = (resolve: Delegate, reject: Delegate<[Error]>) =>
            (error?: Error) => error ? reject(error) : resolve();

        await new Promise<void>((resolve, reject) => server.listen(port, url.hostname, handlerAsync(resolve, reject)));

        return { close: async () => Promise.resolve(server.close()) };
    }

    public static async watch(configuration: Configuration, options: BuildOptions): Promise<CompilerSignal>
    {
        const webpackConfiguration = createBuildConfiguration(configuration, options);

        log(`Watching using ${chalk.bold.green(options.mode)} configuration.`);

        return Compiler.watchInternal(webpackConfiguration, options.logLevel);
    }
}