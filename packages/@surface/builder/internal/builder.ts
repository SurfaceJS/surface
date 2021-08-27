/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/indent */
import type { Delegate }    from "@surface/core";
import webpack              from "webpack";
import WebpackDevServer     from "webpack-dev-server";
import { log }              from "./common.js";
import createConfigurations from "./create-configurations.js";
import type CompilerSignal  from "./types/compiler-signal";
import type Configuration   from "./types/configuration.js";

export default class Builder
{
    private static createHandler(resolve: Delegate, reject: Delegate<[Error]>, logging?: webpack.Configuration["stats"]): (err?: Error, result?: webpack.MultiStats) => unknown
    {
        return (error, stats) => error ? reject(error) : (log(stats?.toString(logging)), resolve());
    }

    private static async runInternal(webpackConfiguration: webpack.Configuration[], logging?: webpack.Configuration["stats"]): Promise<void>
    {
        const compiler = webpack(webpackConfiguration);

        await new Promise<void>((resolve, reject) => compiler.run(this.createHandler(resolve, reject, logging)));
    }

    private static async watchInternal(webpackConfiguration: webpack.Configuration[], logging?: webpack.Configuration["stats"]): Promise<CompilerSignal>
    {
        const compiler = webpack(webpackConfiguration);

        let watching: ReturnType<webpack.MultiCompiler["watch"]>;

        await new Promise<void>((resolve, reject) => watching = compiler.watch({ }, this.createHandler(resolve, reject, logging)));

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

        const server = new WebpackDevServer(devServerConfiguration, webpackCompiler);

        await server.start();

        return { close: async () => server.stop() };
    }

    public static async watch(configuration: Configuration): Promise<CompilerSignal>
    {
        const webpackConfiguration = await createConfigurations("build", configuration);

        return this.watchInternal(webpackConfiguration, configuration.logging);
    }
}