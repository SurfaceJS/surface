/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/indent */
import type { Delegate }                            from "@surface/core";
import { joinPaths }                                from "@surface/core";
import chalk                                        from "chalk";
import webpack                                      from "webpack";
import WebpackDevServer                             from "webpack-dev-server";
import { createOnlyDefinedProxy, createStats, log } from "./common.js";
import createConfigurations                         from "./create-configurations.js";
import type CompilerSignal                          from "./types/compiler-signal";
import type Logging                                 from "./types/logging";
import type Project                                 from "./types/project";

type WebpackOverload = (options: webpack.Configuration | webpack.Configuration[]) => webpack.Compiler | webpack.MultiCompiler;

export default class Builder
{
    private static createHandler(resolve: Delegate, reject: Delegate<[Error]>, logging?: Logging): (err?: Error, result?: webpack.Stats | any) => unknown
    {
        return (error, stats) => error ? reject(error) : (log(stats?.toString(createStats(logging))), resolve());
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

    public static async analyze(project: Project): Promise<void>
    {
        const webpackConfiguration = await createConfigurations("analyze", project);

        log(`Starting ${chalk.bold.green("analyzer...")}`);

        await this.runInternal(webpackConfiguration, project.logging);
    }

    public static async run(project: Project): Promise<void>
    {
        const webpackConfiguration = await createConfigurations("build", project);

        log(`Running using ${chalk.bold.green(project.mode ?? "development")} configuration...`);

        await this.runInternal(webpackConfiguration, project.logging);
    }

    public static async serve(project: Project): Promise<CompilerSignal>
    {
        const publicPath = project.publicPath ?? "/";

        const webpackConfiguration = await createConfigurations("serve", project);
        const webpackCompiler      = (webpack as WebpackOverload)(webpackConfiguration);

        const webpackDevServerConfiguration: WebpackDevServer.Configuration = createOnlyDefinedProxy
        ({
            historyApiFallback: { index: joinPaths(publicPath, "index.html") },
            publicPath,
            ...project.devServer,
        });

        const server = new WebpackDevServer(webpackCompiler, webpackDevServerConfiguration);

        const handlerAsync = (resolve: Delegate, reject: Delegate<[Error]>) =>
            (error?: Error) => error ? reject(error) : resolve();

        await new Promise<void>((resolve, reject) => server.listen(webpackDevServerConfiguration.port!, webpackDevServerConfiguration.host!, handlerAsync(resolve, reject)));

        return { close: async () => Promise.resolve(server.close()) };
    }

    public static async watch(project: Project): Promise<CompilerSignal>
    {
        const webpackConfiguration = await createConfigurations("build", project);

        log(`Watching using ${chalk.bold.green(project.mode ?? "development")} configuration.`);

        return this.watchInternal(webpackConfiguration, project.logging);
    }
}