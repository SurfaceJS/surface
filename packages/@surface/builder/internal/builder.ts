/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/indent */
import type { Delegate }    from "@surface/core";
import webpack              from "webpack";
import WebpackDevServer     from "webpack-dev-server";
import { createStats, log } from "./common.js";
import createConfigurations from "./create-configurations.js";
import type CompilerSignal  from "./types/compiler-signal";
import type Configuration   from "./types/configuration.js";
import type Logging         from "./types/logging";

type WebpackOverload = (options: webpack.Configuration | webpack.Configuration[]) => webpack.Compiler | webpack.MultiCompiler;

export default class Builder
{
    private static createHandler(resolve: Delegate, reject: Delegate<[Error]>, logging?: Logging): (err?: Error, result?: webpack.Stats | any) => unknown
    {
        return (error, stats) => error ? reject(error) : (log(stats?.toString(createStats(logging))), resolve());
    }

    private static async runInternal(webpackConfiguration: webpack.Configuration[], logging?: Logging): Promise<void>
    {
        const webpackCompiler = webpack(webpackConfiguration);

        await new Promise<void>((resolve, reject) => webpackCompiler.run(this.createHandler(resolve, reject, logging)));
    }

    private static async watchInternal(webpackConfiguration: webpack.Configuration | webpack.Configuration[], logging?: Logging): Promise<CompilerSignal>
    {
        const webpackCompiler = (webpack as WebpackOverload)(webpackConfiguration);

        let watching: ReturnType<webpack.Compiler["watch"] | webpack.MultiCompiler["watch"]>;

        await new Promise<void>((resolve, reject) => watching = webpackCompiler.watch({ }, this.createHandler(resolve, reject, logging)));

        return { close: async () => new Promise<void>((resolve, reject) => watching.close(error => error ? reject(error) : resolve())) };
    }

    public static async analyze(project: Configuration): Promise<void>
    {
        const webpackConfiguration = await createConfigurations("analyze", project);

        await this.runInternal(webpackConfiguration, project.logging);
    }

    public static async run(configuration: Configuration): Promise<void>
    {
        const webpackConfiguration = await createConfigurations("build", configuration);

        await this.runInternal(webpackConfiguration, configuration.logging);
    }

    public static async serve(configuration: Configuration): Promise<CompilerSignal>
    {
        const webpackConfigurations = await createConfigurations("serve", configuration);
        const webpackCompiler       = webpack(webpackConfigurations);

        const devServerConfiguration: WebpackDevServer.Configuration =
        {
            historyApiFallback: true,
            ...configuration.devServer,
        };

        const server = new WebpackDevServer(webpackCompiler, devServerConfiguration);

        const handlerAsync = (resolve: Delegate, reject: Delegate<[Error]>) =>
            (error?: Error) => error ? reject(error) : resolve();

        await new Promise<void>((resolve, reject) => server.listen(configuration.devServer?.port ?? 8080, configuration.devServer?.host ?? "localhost", handlerAsync(resolve, reject)));

        return { close: async () => Promise.resolve(server.close()) };
    }

    public static async watch(configuration: Configuration): Promise<CompilerSignal>
    {
        const webpackConfiguration = await createConfigurations("build", configuration);

        return this.watchInternal(webpackConfiguration, configuration.logging);
    }
}