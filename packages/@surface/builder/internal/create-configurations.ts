/* eslint-disable @typescript-eslint/indent */
/* eslint-disable max-lines-per-function */
import path                                       from "path";
import { URL }                                    from "url";
import { merge }                                  from "@surface/core";
import type MergeRules                            from "@surface/core/internal/types/merge-rules";
import CopyPlugin                                 from "copy-webpack-plugin";
import ForkTsCheckerWebpackPlugin                 from "fork-ts-checker-webpack-plugin";
import type { ForkTsCheckerWebpackPluginOptions } from "fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPluginOptions.js";
import HtmlWebpackPlugin                          from "html-webpack-plugin";
import TerserWebpackPlugin                        from "terser-webpack-plugin";
import webpack                                    from "webpack";
import { BundleAnalyzerPlugin }                   from "webpack-bundle-analyzer";
import WorkboxPlugin                              from "workbox-webpack-plugin";
import { createOnlyDefinedProxy }                 from "./common.js";
import loaders                                    from "./loaders.js";
import ForceTsResolvePlugin                       from "./plugins/force-ts-resolve-plugin.js";
import type Configuration                         from "./types/configuration";
import type Project                               from "./types/project";
import type WebpackExtension                      from "./types/webpack-extension";

const DEFAULT_MERGE_RULES: MergeRules<webpack.Configuration> =
{
    module:
    {
        rules:
        // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
        // @ts-ignore
        {
            oneOf:
            {
                test: "match",
                use:
                {
                    loader:  "match",
                    options: "merge",
                },
            },
            test: "match",
            use:
            {
                loader:  "match",
                options: "merge",
            },
        },
    },
    plugins: "append",
    resolve:
    {
        extensions: "append",
        plugins:    "append",
    },
};

function configureDevServerEntry(entry: webpack.Entry | undefined, url: URL): webpack.Entry | undefined
{
    const webpackDevServerClient = `webpack-dev-server/client?${url}`;
    const webpackHotDevServer    = "webpack/hot/dev-server";

    return Array.isArray(entry)
        ? [webpackDevServerClient, webpackHotDevServer, ...entry]
        : typeof entry == "object"
            ? { [webpackDevServerClient]: webpackDevServerClient, [webpackHotDevServer]: webpackHotDevServer, ...entry }
            : typeof entry == "string"
                ? [webpackDevServerClient, webpackHotDevServer, entry]
                : entry;
}

function mapConfiguration(configuration: Partial<Configuration> & { mode?: webpack.Configuration["mode"] }): webpack.Configuration
{
    const resolvePlugins: webpack.ResolveOptions["plugins"] = [];
    const plugins:        webpack.WebpackPluginInstance[]   = [];

    const forkTsCheckerWebpackPluginOptions: ForkTsCheckerWebpackPluginOptions =
    {
        eslint:
        {
            files:   `${configuration.context}/**/*.{js,ts}`,
            options: createOnlyDefinedProxy
            ({
                configFile: configuration.eslintrc,
                cwd:        configuration.context,
            }),
        },
        typescript: createOnlyDefinedProxy
        ({
            build:      true,
            configFile: configuration.tsconfig,
            context:    configuration.context,
        }),
    };

    plugins.push(new webpack.WatchIgnorePlugin({ paths: [/\.js$/, /\.d\.ts$/] }));
    plugins.push(new ForkTsCheckerWebpackPlugin(forkTsCheckerWebpackPluginOptions));

    const tersePlugin = new TerserWebpackPlugin
    ({
        extractComments: true,
        parallel:        true,
        terserOptions:
        {
            compress: true,
            mangle:   true,
        },
    });

    const isProduction = configuration.mode == "production";

    const webpackConfiguration: webpack.Configuration =
    {
        cache:
        {
            name: ".cache",
            type: "filesystem",
        },
        context: configuration.context,
        devtool: isProduction ? false : "source-map",
        entry:   configuration.entry,
        mode:    "development",
        module:
        {
            rules:
            [
                {
                    test: /(manifest\.webmanifest|browserconfig\.xml)$/,
                    use:
                    [
                        loaders.file,
                        loaders.appManifest,
                    ],
                },
                {
                    test: /\.(png|jpe?g|svg|ttf|woff2?|eot)$/,
                    use:  loaders.fileAssets,
                },
                {
                    oneOf:
                    [
                        {
                            resourceQuery: /global/,
                            use:
                            [
                                loaders.style,
                                loaders.css,
                                loaders.resolveUrl,
                                loaders.sass,
                            ],
                        },
                        {
                            resourceQuery: /raw/,
                            use:
                            [
                                loaders.toString,
                                loaders.css,
                                loaders.resolveUrl,
                                loaders.sass,
                            ],
                        },
                        {
                            resourceQuery: /file/,
                            use:
                            [
                                loaders.fileAssetsCss,
                                loaders.extract,
                                loaders.css,
                                loaders.resolveUrl,
                                loaders.sass,
                            ],
                        },
                        {
                            use:
                            [
                                loaders.toString,
                                loaders.css,
                                loaders.resolveUrl,
                                loaders.sass,
                            ],
                        },
                    ],
                    test:  /\.s?css$/,
                },
                {
                    test: /\.html$/,
                    use:  loaders.html,
                },
                {
                    test: /\.ts$/,
                    use:
                    [
                        loaders.thread,
                        loaders.ts,
                    ],
                },
            ],
        },
        name:         configuration.name,
        optimization:
        {
            chunkIds:             isProduction ? "total-size" : "named",
            concatenateModules:   isProduction,
            emitOnErrors:         false,
            flagIncludedChunks:   isProduction,
            mergeDuplicateChunks: isProduction,
            minimize:             isProduction,
            minimizer:            [tersePlugin],
            moduleIds:            isProduction ? "size" : "named",
            providedExports:      true,
            usedExports:          isProduction,
        },
        output:
        {
            filename:   configuration.filename,
            path:       configuration.output,
            pathinfo:   !isProduction,
            publicPath: configuration.publicPath,
        },
        performance:
        {
            hints: isProduction ? "warning" : false,
        },
        plugins,
        resolve:
        {
            extensions:     [".ts", ".js", ".json", ".wasm"],
            plugins:        resolvePlugins,
            preferRelative: true,
        },
        resolveLoader:
        {
            preferRelative: true,
        },
    };

    return webpackConfiguration;
}

async function applyPostConfiguration(webpackConfiguration: webpack.Configuration, extension: WebpackExtension | undefined): Promise<webpack.Configuration>
{
    const mergedConfiguration = typeof extension?.configuration == "object"
        ? merge([webpackConfiguration, extension.configuration], extension.mergeRules ?? DEFAULT_MERGE_RULES)
        : webpackConfiguration;

    return typeof extension?.postConfiguration == "function"
        ? extension.postConfiguration(mergedConfiguration)
        : mergedConfiguration;
}

export default async function createConfigurations(type: "analyze" | "build" | "serve", project: Project): Promise<webpack.Configuration[]>
{
    const mainConfiguration = mapConfiguration(project);

    const resolvePlugins: webpack.ResolveOptions["plugins"] = [];
    const plugins:        webpack.WebpackPluginInstance[]   = [];
    const sharePlugins:   webpack.WebpackPluginInstance[]   = [];

    if (project.includeFiles)
    {
        const patterns = project.includeFiles
            .map
            (
                pattern =>
                {
                    if (typeof pattern == "string")
                    {
                        const [from, to = project.output!] = pattern.split(":");

                        return { from, to };
                    }

                    return pattern;
                },
            );

        const copyPlugin = new CopyPlugin({ patterns });

        plugins.push(copyPlugin);
    }

    if (project.preferTs)
    {
        const paths = !Array.isArray(project.preferTs)
            ? []
            : project.preferTs;

        resolvePlugins.push(new ForceTsResolvePlugin(paths));
    }

    const htmlWebpackPluginOptions = typeof project.htmlTemplate == "string"
        ? { template: project.htmlTemplate }
        : project.htmlTemplate;

    plugins.push(new HtmlWebpackPlugin(htmlWebpackPluginOptions));

    if (project.useWorkbox)
    {
        plugins.push(new WorkboxPlugin.GenerateSW({ clientsClaim: true, skipWaiting: true }));
    }

    switch (type)
    {
        case "analyze":
            plugins.push(new BundleAnalyzerPlugin(project.bundlerAnalyzer ?? { }));
            break;
        case "serve":
            {
                const
                {
                    host = "http://localhost",
                    port = 8080,
                } = project.devServer ?? { };

                const url = new URL(host);

                url.port     = port.toString();
                url.pathname = project.publicPath ?? "/";

                mainConfiguration.entry = configureDevServerEntry(project.entry, url);

                sharePlugins.push(new webpack.HotModuleReplacementPlugin());
            }
            break;
        default:
            break;
    }

    mainConfiguration.plugins!.push(...plugins, ...sharePlugins);
    mainConfiguration.resolve!.plugins!.push(...resolvePlugins);

    const webpackConfigurations = [await applyPostConfiguration(mainConfiguration, project.webpack)];

    if (project.dependencies)
    {
        let index = 0;

        for (const configuration of project.dependencies)
        {
            const webpackConfiguration = mapConfiguration({ ...configuration, mode: project.mode });

            if (type == "analyze")
            {
                const analyzerPort = typeof project.bundlerAnalyzer?.analyzerPort == "number"
                    ? project.bundlerAnalyzer.analyzerPort + index + 1
                    : project.bundlerAnalyzer?.analyzerPort;

                const parsed = path.parse(project.bundlerAnalyzer?.reportFilename ?? "report.html");

                const reportFilename = `${parsed.dir + parsed.name}_${configuration.name ?? String(index + 1)}${parsed.ext}`;

                webpackConfiguration.plugins!.push(new BundleAnalyzerPlugin({ ...project.bundlerAnalyzer ?? { }, analyzerPort, reportFilename }));
            }

            webpackConfiguration.plugins!.push(...sharePlugins);
            webpackConfiguration.resolve!.plugins!.push(...resolvePlugins);

            webpackConfigurations.push(await applyPostConfiguration(webpackConfiguration, configuration.webpack));

            index++;
        }
    }

    return webpackConfigurations;
}