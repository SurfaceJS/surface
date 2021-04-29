/* eslint-disable max-lines-per-function */
import { URL }                                    from "url";
import { CleanWebpackPlugin }                     from "clean-webpack-plugin";
import CopyPlugin                                 from "copy-webpack-plugin";
import ForkTsCheckerWebpackPlugin                 from "fork-ts-checker-webpack-plugin";
import type { ForkTsCheckerWebpackPluginOptions } from "fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPluginOptions.js";
import HtmlWebpackPlugin                          from "html-webpack-plugin";
import TerserWebpackPlugin                        from "terser-webpack-plugin";
import webpack                                    from "webpack";
import { BundleAnalyzerPlugin }                   from "webpack-bundle-analyzer";
import WorkboxPlugin                              from "workbox-webpack-plugin";
import applyProjectDefaults                       from "./apply-project-defaults.js";
import loaders                                    from "./loaders.js";
import OverrideResolvePlugin                      from "./plugins/override-resolver-plugin.js";
import PreferTsResolverPlugin                     from "./plugins/prefer-ts-resolver-plugin.js";
import type Configuration                         from "./types/configuration";

function configureDevServerEntry(entry: webpack.Entry, url: URL): webpack.Entry
{
    const webpackDevServerClient = `webpack-dev-server/client?${url}`;
    const webpackHotDevServer    = "webpack/hot/dev-server";

    return Array.isArray(entry)
        ? [webpackDevServerClient, webpackHotDevServer, ...entry]
        : typeof entry == "object"
            ? { [webpackDevServerClient]: webpackDevServerClient, [webpackHotDevServer]: webpackHotDevServer, ...entry }
            : [webpackDevServerClient, webpackHotDevServer, entry as string];
}

export default async function createConfigurations(type: "analyze" | "build" | "serve", configuration: Configuration): Promise<webpack.Configuration[]>
{
    const projects = configuration.projects ?? { default: { } };
    const main     = configuration.main     ?? Object.keys(projects)[0];

    const generateSWPlugin = new WorkboxPlugin.GenerateSW({ clientsClaim: true, skipWaiting: true });

    const webPackconfigurations: webpack.Configuration[] = [];

    for (const [name, _project] of Object.entries(projects))
    {
        const project            = applyProjectDefaults(_project);
        const buildConfiguration = project!.configurations![project.mode!];

        const resolvePlugins: webpack.ResolveOptions["plugins"] = [];
        const plugins:        webpack.WebpackPluginInstance[]   = [];

        const forkTsCheckerWebpackPluginOptions: ForkTsCheckerWebpackPluginOptions =
        {
            eslint:
            {
                enabled: project.eslint!.enabled,
                files:   project.eslint!.files!,
                options:
                {
                    configFile: project.eslint!.eslintrc,
                    cwd:        project.eslint!.cwd,
                },
            },
            typescript:
            {
                build:      true,
                configFile: project.tsconfig,
                context:    project.context,
            },
        };

        if (configuration.clean)
        {
            plugins.push(new CleanWebpackPlugin());
        }

        plugins.push(new webpack.WatchIgnorePlugin({ paths: [/\.js$/, /\.d\.ts$/] }));
        plugins.push(new webpack.ProgressPlugin());
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

        if (project.includeFiles)
        {
            const copyPlugin = new CopyPlugin({ patterns: project.includeFiles });

            plugins.push(copyPlugin);
        }

        if (project.preferTs)
        {
            const paths = !Array.isArray(project.preferTs) ? undefined : project.preferTs;

            resolvePlugins.push(new PreferTsResolverPlugin(paths));
        }

        if (buildConfiguration?.overrides)
        {
            resolvePlugins.push(new OverrideResolvePlugin(buildConfiguration.overrides));
        }

        if (project.target == "pwa")
        {
            plugins.push(generateSWPlugin);
        }

        const isTargetingBrowser = project.target == "pwa" || project.target == "web";

        if (isTargetingBrowser)
        {
            const htmlWebpackPluginOptions = typeof project.index == "string"
                ? { template: project.index }
                : project.index;

            plugins.push(new HtmlWebpackPlugin(htmlWebpackPluginOptions));
        }

        switch (type)
        {
            case "analyze":
                plugins.push(new BundleAnalyzerPlugin({ reportFilename: `${name}.html`, ...project.analyzer }));
                break;
            case "serve":
                if (name == main && isTargetingBrowser)
                {
                    const { host = "http://localhost", port = 8080 } = configuration.devServer ?? { };

                    const url = new URL(host);

                    url.port     = port.toString();
                    url.pathname = project.publicPath!;

                    project.entry = configureDevServerEntry(project.entry!, url);

                    plugins.push(new webpack.HotModuleReplacementPlugin());
                }
                break;
            default:
                break;
        }

        const isProduction = project.mode == "production";

        const webpackConfiguration: webpack.Configuration =
        {
            cache:   buildConfiguration?.cache,
            context: project.context,
            devtool: isProduction ? false : "source-map",
            entry:   project.entry,
            mode:    project.mode,
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
            name,
            optimization: { minimizer: [tersePlugin],  ...buildConfiguration?.optimization },
            output:
            {
                filename:   project.filename,
                path:       project.output,
                pathinfo:   !isProduction,
                publicPath: project.publicPath,
            },
            performance: buildConfiguration?.performance,
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

        webPackconfigurations.push(await configuration.hooks?.configured?.(webpackConfiguration) ?? webpackConfiguration);
    }

    return webPackconfigurations;
}