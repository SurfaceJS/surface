import * as defaults from "./defaults";
import * as enums    from "./enums";
import { Compiler }  from "../types";

import { merge, resolveFile } from "@surface/common";
import HtmlTemplatePlugin     from "@surface/html-template-plugin";
import SimblingResolvePlugin  from "@surface/simbling-resolve-plugin";

import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import fs                         from "fs";
import path                       from "path";
import rimraf                     from "rimraf";
import UglifyJsPlugin             from "uglifyjs-webpack-plugin";
import webpack                    from "webpack";

export async function execute(task?: enums.TasksType, config?: string, env?: string, watch?: boolean, statsLevel?: webpack.Stats.Preset): Promise<void>
{
    task   = task   || enums.TasksType.build;
    config = config || "./";

    let enviroment = env ? enums.EnviromentType[env] : enums.EnviromentType.development;

    watch = !!watch;

    let wepackconfig = getConfig(config, enviroment);

    switch (task)
    {
        case enums.TasksType.build:
        default:
            await build(wepackconfig, enviroment, watch, statsLevel);
            break;
        case enums.TasksType.clean:
            await clean(wepackconfig);
            break;
        case enums.TasksType.rebuild:
            await clean(wepackconfig);
            await build(wepackconfig, enviroment, watch, statsLevel);
            break;
    }
}

/**
 * Build Surface project using provided configuration.
 * @param config     Webpack configuration.
 * @param enviroment Enviroment variable.
 * @param watch      Enable watch mode.
 */
async function build(config: webpack.Configuration, enviroment: enums.EnviromentType, watch: boolean, statsLevel?: webpack.Stats.Preset): Promise<void>
{
    let compiler = webpack(config);

    let statOptions: webpack.Stats.ToStringOptions = statsLevel ||
    {
        assets:   true,
        errors:   true,
        colors:   true,
        version:  true,
        warnings: true
    };

    let callback: webpack.Compiler.Handler =
        (error, stats) => error ? console.log(error.message) : console.log(stats.toString(statOptions));

    console.log(`Starting ${watch ? "Watch" : "build"} using ${enviroment} configuration.`);

    if (watch)
    {
        compiler.watch({ aggregateTimeout: 500, poll: true, ignored: /node_modules/ }, callback);
    }
    else
    {
        compiler.run(callback);
    }
}

/**
 * Clean target output
 * @param config Webpack configuration
 */
async function clean(config: webpack.Configuration): Promise<void>
{
    if (config.output && config.output.path)
    {
        let outputPath = config.output.path;

        let promises =
        [
            new Promise(resolve => rimraf(outputPath, resolve)),
            new Promise(resolve => rimraf(path.resolve(__dirname, "cache-loader"), resolve))
        ];

        await Promise.all(promises);
    }
    else
    {
        throw new Error("Invalid output path.");
    }
}

/**
 * Get Webpack config based on Surface config.
 * @param path        Path to Surface config.
 * @param enviroment  Enviroment variable.
 */
function getConfig(filepath: string, enviroment: enums.EnviromentType): webpack.Configuration
{
    filepath = resolveFile(process.cwd(), filepath, "surface.config.json");

    let config = require(filepath) as Compiler.Config;

    const root = path.dirname(filepath);

    if (!config.context)
    {
        throw new TypeError("Property \"context\" can\"t be null");
    }

    if (!config.entry)
    {
        throw new TypeError("Property \"entry\" can\"t be null");
    }

    if (!config.output)
    {
        throw new TypeError("Property \"output\" can\"t be null");
    }

    config.context = path.resolve(root, config.context);
    config.entry   = resolveEntries(config.context, config.entry);
    config.runtime = config.runtime || Object.keys(config.entry)[0];
    config.output  = path.resolve(root, config.output);

    let userWebpack: webpack.Configuration = { };

    if (config.webpackConfig)
    {
        if(typeof config.webpackConfig == "string" && fs.existsSync(config.webpackConfig))
        {
            userWebpack = require(path.resolve(root, config.webpackConfig)) as webpack.Configuration;
        }
        else
        {
            userWebpack = config.webpackConfig as webpack.Configuration;
        }
    }

    config.tsconfig = config.tsconfig && path.resolve(root, config.tsconfig) || "tsconfig.json";
    config.tslint   = config.tslint   && path.resolve(root, config.tslint);

    defaults.loaders.tsLoader.options.configFile = config.tsconfig;

    let resolvePlugins: Array<webpack.ResolvePlugin> = [];
    let plugins: Array<webpack.Plugin> = [];

    if (config.simblingResolve)
    {
        if (!Array.isArray(config.simblingResolve))
        {
            config.simblingResolve = [config.simblingResolve];
        }

        for (let option of config.simblingResolve)
        {
            if (option.include)
            {
                option.include = option.include.map(x => path.resolve(root, x));
            }

            if (option.exclude)
            {
                option.exclude = option.exclude.map(x => path.resolve(root, x));
            }

            resolvePlugins.push(new SimblingResolvePlugin(option));
        }
    }

    plugins.push(new webpack.optimize["SplitChunksPlugin"]({ name: config.runtime }));
    plugins.push(new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]));
    plugins.push(new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true, tsconfig: config.tsconfig, tslint: config.tslint, watch: config.context }));

    if (config.htmlTemplate)
    {
        config.htmlTemplate.template = path.resolve(root, config.htmlTemplate.template);
        plugins.push(new HtmlTemplatePlugin(config.htmlTemplate));
    }

    let primaryConfig =
    {
        context: config.context,
        entry:   config.entry,
        mode:    enums.EnviromentType.development,
        output:
        {
            path:       config.output,
            filename:   config.filename,
            publicPath: "/"
        },
        resolve:
        {
            modules: [config.context],
            plugins: resolvePlugins
        },
        plugins: plugins
    } as webpack.Configuration;

    if (primaryConfig.plugins && enviroment == enums.EnviromentType.production)
    {
        primaryConfig.devtool = false;

        const uglifyOptions =
        {
            compress: { keep_classnames: true },
            mangle:   { keep_classnames: true }
        };

        primaryConfig.plugins.push(new UglifyJsPlugin({ parallel: true, extractComments: true, uglifyOptions }));
    }

    let webpackConfig = merge({ }, [defaults.webpackConfig, userWebpack, primaryConfig], true);

    return webpackConfig;
}

/**
 * Resolve entries.
 * @param entries Entries to be resolved.
 * @param context Context used to resolve entries.
 */
function resolveEntries(context: string, entries: Compiler.Entry): Compiler.Entry
{
    let result: Compiler.Entry = { };

    if (typeof entries == "string")
    {
        entries = [entries];
    }

    if (Array.isArray(entries))
    {
        let tmp: Compiler.Entry = { };
        for (let entry of entries)
        {
            tmp[path.dirname(entry)] = entry;
        }

        entries = tmp;
    }

    for (let key in entries)
    {
        let value   = entries[key];
        let sources = Array.isArray(value) ? value : [value];

        for (let source of sources)
        {
            if (source.endsWith("/*"))
            {
                source = source.replace(/\/\*$/, "");
            }

            let sourcePath = path.resolve(context, source);

            if (fs.lstatSync(sourcePath).isDirectory())
            {
                for (let $module of fs.readdirSync(sourcePath))
                {
                    let modulePath = path.resolve(sourcePath, $module);
                    if (fs.existsSync(modulePath))
                    {
                        if(fs.lstatSync(modulePath).isDirectory())
                        {
                            let index = fs.readdirSync(modulePath).filter(x => x.match(/index\.[tj]s/))[0];
                            if (index)
                            {
                                result[`${key}/${$module}`] = `${source}/${$module}/${index}`;
                            }
                        }
                        else
                        {
                            result[`${source}/${path.parse($module).name}`] = `${source}/${$module}`;
                        }
                    }
                    else
                    {
                        throw new Error("Invalid path");
                    }
                }
            }
            else
            {
                setOrPush(result, key, source);
            }
        }
    }

    return result;
}

/**
 * Set or push value in a string|Array<string> value of the object.
 * @param target Target object.
 * @param key    Key of the object.
 * @param value  Value to be setted or pushed.
 */
function setOrPush(target: Compiler.Entry, key: string, value: string): void
{
    if (!target[key])
    {
        target[key] = value;
    }
    else if (!Array.isArray(target[key]))
    {
        target[key] = [target[key]].concat(value) as Array<string>;
    }
    else
    {
        (target[key] as Array<string>).push(value);
    }
}