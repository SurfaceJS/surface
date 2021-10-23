/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
import { readlinkSync }                               from "fs";
import path                                           from "path";
import { URL }                                        from "url";
import { DeepMergeFlags, deepMerge }                  from "@surface/core";
import { isSymbolicLink, lookup }                     from "@surface/io";
import { CleanWebpackPlugin }                         from "clean-webpack-plugin";
import CopyPlugin                                     from "copy-webpack-plugin";
import EslintWebpackPlugin                            from "eslint-webpack-plugin";
import type { Options as EslintWebpackPluginOptions } from "eslint-webpack-plugin";
import ForkTsCheckerWebpackPlugin                     from "fork-ts-checker-webpack-plugin";
import type { ForkTsCheckerWebpackPluginOptions }     from "fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPluginOptions.js";
import HtmlWebpackPlugin                              from "html-webpack-plugin";
import TerserWebpackPlugin                            from "terser-webpack-plugin";
import webpack                                        from "webpack";
import { BundleAnalyzerPlugin }                       from "webpack-bundle-analyzer";
import WorkboxPlugin                                  from "workbox-webpack-plugin";
import loaders                                        from "./loaders.js";
import type { FileOverride }                          from "./plugins/override-resolver-plugin.js";
import OverrideResolvePlugin                          from "./plugins/override-resolver-plugin.js";
import PreferTsResolverPlugin                         from "./plugins/prefer-ts-resolver-plugin.js";
import type Configuration                             from "./types/configuration";
import type Project                                   from "./types/project";

const PROJECT_DEFAULTS: Project =
{
    analyzer:
    {
        analyzerMode: "static",
    },
    environments:
    {
        development:
        {
            cache:
            {
                maxAge: 3600000,
                name:   ".cache",
                type:   "filesystem",
            },
            optimization:
            {
                chunkIds:             "named",
                concatenateModules:   false,
                emitOnErrors:         false,
                flagIncludedChunks:   false,
                mangleExports:        false,
                mergeDuplicateChunks: false,
                minimize:             false,
                moduleIds:            "named",
                providedExports:      true,
                usedExports:          false,
            },
            performance:
            {
                hints: false,
            },
        },
        production:
        {
            cache:        false,
            optimization:
            {
                chunkIds:             "total-size",
                concatenateModules:   true,
                emitOnErrors:         false,
                flagIncludedChunks:   true,
                mangleExports:        true,
                mergeDuplicateChunks: true,
                minimize:             true,
                moduleIds:            "size",
                providedExports:      true,
                usedExports:          true,
            },
            performance:
            {
                hints: "error",
            },
        },
    },
    mode:       "development",
    publicPath: "/",
    target:     "web",
};

function configureDevServerEntry(entry: Project["entry"], url: URL): Project["entry"]
{
    const webpackDevServerClient = `webpack-dev-server/client?${url}`;
    const webpackHotDevServer    = "webpack/hot/dev-server";

    return Array.isArray(entry)
        ? [webpackDevServerClient, webpackHotDevServer, ...entry]
        : typeof entry == "object"
            ? { [webpackDevServerClient]: webpackDevServerClient, [webpackHotDevServer]: webpackHotDevServer, ...entry }
            : typeof entry == "string"
                ? [webpackDevServerClient, webpackHotDevServer, entry]
                : [webpackDevServerClient, webpackHotDevServer, "./src"];
}

export default async function createConfigurations(type: "analyze" | "build" | "serve", configuration: Configuration): Promise<webpack.Configuration[]>
{
    const projects = configuration.projects ?? { default: { } };
    const main     = configuration.main     ?? Object.keys(projects)[0];

    const webPackconfigurations: webpack.Configuration[] = [];

    for (const [name, _project] of Object.entries(projects))
    {
        const project            = deepMerge([PROJECT_DEFAULTS, _project], DeepMergeFlags.IgnoreUndefined);
        const buildConfiguration = project!.environments![project.mode!];

        const resolvePlugins: webpack.ResolveOptions["plugins"] = [];
        const plugins:        webpack.WebpackPluginInstance[]   = [];

        if (project.eslint?.enabled)
        {
            const eslintWebpackPluginOptions: EslintWebpackPluginOptions =
            {
                files:              project.eslint?.files ?? `${project.context ?? `${process.cwd()}/!(node_modules)`}/**/*.{js,ts}`,
                formatter:          project.eslint?.formatter,
                overrideConfig:     project.eslint?.config,
                overrideConfigFile: project.eslint?.configFile,
                threads:            true,
                useEslintrc:        true,
            };

            plugins.push(new EslintWebpackPlugin(eslintWebpackPluginOptions));
        }

        const forkTsCheckerWebpackPluginOptions: ForkTsCheckerWebpackPluginOptions =
        {
            typescript:
            {
                build:      true,
                configFile: project.tsconfig,
                context:    project.context,
            },
        };

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

        if (configuration.clean)
        {
            plugins.push(new CleanWebpackPlugin());
        }

        if (project.includeFiles)
        {
            const copyPlugin = new CopyPlugin({ patterns: project.includeFiles });

            plugins.push(copyPlugin);
        }

        if (project.target == "pwa")
        {
            plugins.push(new WorkboxPlugin.GenerateSW({ clientsClaim: true, skipWaiting: true, swDest: `${name}-service-worker.js` }));
        }

        if (buildConfiguration?.variables)
        {
            plugins.push(new webpack.EnvironmentPlugin(buildConfiguration.variables));
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

        if (project.templateExpressionMode == "aot")
        {
            let customElement = lookup(project.context ?? process.cwd(), "node_modules/@surface/custom-element");

            if (customElement)
            {
                if (isSymbolicLink(customElement))
                {
                    customElement = readlinkSync(customElement);
                }

                const decorators = "internal/decorators";

                const overrides: FileOverride[] =
                [
                    { replace: path.join(customElement!, decorators, "element.js"), with: path.join(customElement!, decorators, "element.aot.js") },
                    { replace: path.join(customElement!, decorators, "element.ts"), with: path.join(customElement!, decorators, "element.aot.ts") },
                ];

                resolvePlugins.push(new OverrideResolvePlugin(overrides));
            }
        }

        const isTargetingBrowser = project.target == "pwa" || project.target == "web";

        if (isTargetingBrowser)
        {
            const htmlWebpackPluginOptions: HtmlWebpackPlugin.Options = typeof project.index == "string"
                ? { template: project.index }
                : { title: "Surface App", ...project.index };

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

                    project.entry = configureDevServerEntry(project.entry, url);

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
                        test: /\.htmx$/,
                        use:
                        [
                            loaders.customElementLoader,
                        ],
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