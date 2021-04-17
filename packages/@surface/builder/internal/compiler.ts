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
import type CliAnalyzerOptions  from "./types/cli-analyzer-options";
import type CliBuildOptions     from "./types/cli-build-options";
import type CliDevServerOptions from "./types/cli-dev-serve-options";
import type CompilerSignal      from "./types/compiler-signal";
import type Configuration       from "./types/configuration";
import type Logging             from "./types/logging.js";

type WebpackOverload = (options: webpack.Configuration | webpack.Configuration[]) => webpack.Compiler | webpack.MultiCompiler;

export default class Compiler
{
    private static createHandler(resolve: Delegate, reject: Delegate<[Error]>, logging?: Logging): (err?: Error, result?: webpack.Stats | any) => unknown
    {
        return (error, stats) => error ? reject(error) : (log(stats?.toString(this.createStats(logging))), resolve());
    }

    private static createStats(logging: Logging = true): webpack.Configuration["stats"]
    {
        if (logging && logging != "none")
        {
            return {
                assets:       logging == true,
                children:     logging == true,
                colors:       true,
                errorDetails: logging == "verbose",
                errors:       logging != "info",
                logging:      logging == true ? "info" : logging,
                modules:      logging == true || logging == "log" || logging == "verbose",
                version:      logging == true || logging == "log" || logging == "verbose",
                warnings:     logging != "info",
            };
        }

        return {
            assets:   false,
            colors:   true,
            errors:   false,
            logging:  "none",
            modules:  false,
            warnings: false,
        };
    }

    private static async runInternal(webpackConfiguration: webpack.Configuration | webpack.Configuration[], logging?: Logging): Promise<void>
    {
        const webpackCompiler = (webpack as WebpackOverload)(webpackConfiguration);

        await new Promise<void>((resolve, reject) => webpackCompiler.run(this.createHandler(resolve, reject, logging)));
    }

    private static async watchInternal(webpackConfiguration: webpack.Configuration | webpack.Configuration[], logging?: Logging): Promise<CompilerSignal>
    {
        const webpackCompiler = (webpack as WebpackOverload)(webpackConfiguration);

        let watching: ReturnType<webpack.Compiler["watch"] | webpack.MultiCompiler["watch"]>;

        await new Promise<void>((resolve, reject) => watching = webpackCompiler.watch({ }, this.createHandler(resolve, reject, logging)));

        return { close: async () => new Promise<void>((resolve, reject) => watching.close(error => error ? reject(error) : resolve())) };
    }

    public static async analyze(configuration: Configuration, options: CliAnalyzerOptions): Promise<void>
    {
        const webpackConfiguration = await createAnalyzerConfiguration(configuration, options);

        log(`Starting ${chalk.bold.green("analyzer...")}`);

        await this.runInternal(webpackConfiguration, options.logging);
    }

    public static async run(configuration: Configuration, options: CliBuildOptions): Promise<void>
    {
        const webpackConfiguration = await createBuildConfiguration(configuration, options);

        log(`Running using ${chalk.bold.green(options.mode ?? "development")} configuration...`);

        await this.runInternal(webpackConfiguration, options.logging);
    }

    public static async serve(configuration: Configuration, options: CliDevServerOptions): Promise<CompilerSignal>
    {
        const
        {
            host    = "http://localhost",
            logging,
            port    = 8080,
        } = options;

        const url = new URL(host);

        url.port     = port.toString();
        url.pathname = configuration.publicPath ?? "/";

        const webpackConfiguration = await createDevServerConfiguration(configuration, url);
        const webpackCompiler      = (webpack as WebpackOverload)(webpackConfiguration);

        const webpackDevServerConfiguration: WebpackDevServer.Configuration = createOnlyDefinedProxy
        ({
            historyApiFallback: { index: joinPaths(url.pathname, "index.html") },
            host:               url.hostname,
            hot:                options.hot,
            port,
            publicPath:         url.pathname,
            stats:              this.createStats(logging),
            ...configuration.devServer,
        });

        const server = new WebpackDevServer(webpackCompiler, webpackDevServerConfiguration);

        const handlerAsync = (resolve: Delegate, reject: Delegate<[Error]>) =>
            (error?: Error) => error ? reject(error) : resolve();

        await new Promise<void>((resolve, reject) => server.listen(webpackDevServerConfiguration.port!, webpackDevServerConfiguration.host!, handlerAsync(resolve, reject)));

        return { close: async () => Promise.resolve(server.close()) };
    }

    public static async watch(configuration: Configuration, options: CliBuildOptions): Promise<CompilerSignal>
    {
        const webpackConfiguration = await createBuildConfiguration(configuration, options);

        log(`Watching using ${chalk.bold.green(options.mode)} configuration.`);

        return this.watchInternal(webpackConfiguration, options.logging);
    }
}