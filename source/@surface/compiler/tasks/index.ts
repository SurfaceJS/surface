import rimraf  = require('rimraf');
import FS      = require('fs');
import Path    = require('path');
import Webpack = require('webpack');

import { Compiler }    from '@surface/compiler/types';
import { Constructor } from '@surface/types';

import Common                     = require('@surface/common');
import ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
import UglifyJsPlugin             = require('uglifyjs-webpack-plugin');
import Defaults                   = require('./defaults');
import Enums                      = require('./enums');

/**
 * Build Surface project using provided configuration.
 * @param config     Webpack configuration.
 * @param enviroment Enviroment variable.
 * @param watch      Enable watch mode.
 */
async function build(config: Webpack.Configuration, enviroment: Enums.EnviromentType, watch: boolean): Promise<void>
{
    let compiler = Webpack(config);

    let statOptions: Webpack.Stats.ToStringOptions =
    {
        assets:   true,
        version:  true,
        colors:   true,
        warnings: true,
        errors:   true
    };

    let callback: Webpack.Compiler.Handler =
        (error, stats) => error ? console.log(error.message) : console.log(stats.toString(statOptions));

    console.log(`Starting ${watch ? 'Watch' : 'build'} using ${enviroment} configuration.`);
    
    if (watch)
        compiler.watch({ aggregateTimeout: 500, poll: true, ignored: /node_modules/ }, callback);
    else
        compiler.run(callback);
}

/**
 * Clean target output 
 * @param config Webpack configuration
 */
async function clean(config: Webpack.Configuration): Promise<void>
{
    await new Promise(resolve => rimraf(config.output!.path!, resolve));
}

/**
 * Get Webpack config based on Surface config.
 * @param path        Path to Surface config.
 * @param Enviroment  Enviroment variable.
 */
function getConfig(path: string, Enviroment: Enums.EnviromentType): Webpack.Configuration
{
    path = resolveConfig(path);

    let root = Path.dirname(path);
    let config = require(path) as Compiler.Config;

    if (!config.context)
        throw new TypeError('Property \'context\' can\'t be null');

    if (!config.entry)
        throw new TypeError('Property \'entry\' can\'t be null');

    if (!config.output)
        throw new TypeError('Property \'output\' can\'t be null');

    config.filename = config.filename || '[name].js'

    config.entry   = resolveEntries(config.entry, config.context);
    config.runtime = config.runtime || Object.keys(config.entry)[0];
    
    config.context = Path.resolve(root, config.context);
    config.output  = Path.resolve(root, config.output);
    
    let userWebpack: Webpack.Configuration = { };

    if (config.webpackConfig)
    {
        if(typeof config.webpackConfig == 'string' && FS.existsSync(config.webpackConfig))
            userWebpack = require(Path.resolve(Path.dirname(path), config.webpackConfig)) as Webpack.Configuration;
        else
            userWebpack = config.webpackConfig as Webpack.Configuration;
    }

    if (config.tsconfig)
        Defaults.loaders.tsLoader.options.configFile = config.tsconfig;

    let nodeModules = Common.lookUp(config.context, 'node_modules');

    let primaryConfig =
    {
        context: config.context,
        entry:   config.entry,
        output:
        {
            path:     config.output,
            filename: config.filename
        },
        resolve:
        {
            modules: [config.context]
        },
        plugins: getSurfacePlugins(config.plugins || [], nodeModules)
    } as Webpack.Configuration;

    primaryConfig.plugins = primaryConfig.plugins || [];

    if (Enviroment == Enums.EnviromentType.production)
        primaryConfig.plugins.push(new UglifyJsPlugin({ parallel: true, extractComments: true }));
        
        primaryConfig.plugins.push(new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true, watch: primaryConfig.context }));
        primaryConfig.plugins.push(new Webpack.optimize.CommonsChunkPlugin({ name: config.runtime }));

    let webpackConfig = Common.objectMerge(Defaults.webpack, [userWebpack, primaryConfig], true);

    return webpackConfig;
}

/**
 * Require Surface's plugins.
 * @param plugins         Plugins to be required.
 * @param nodeModulesPath Path to 'node_modules' folder.
 */
function getSurfacePlugins(plugins: Array<Compiler.Plugin>, nodeModulesPath: string): Array<Webpack.Plugin>
{    
    let result: Array<Webpack.Plugin> = [];
    
    for (let plugin of plugins)
    {
        if (!plugin.name.endsWith("-plugin"))
            plugin.name = `${plugin.name}-plugin`;
        
        let Plugin = require(Path.resolve(nodeModulesPath, `@surface/${plugin.name}`)) as Constructor<Webpack.Plugin>;
        result.push(new Plugin(plugin.options));
    }

    return result;
}

/**
 * Resolve surface's config file location
 * @param path Path to folder or file
 */
function resolveConfig(path: string)
{
    if (!Path.isAbsolute(path))
        path = Path.resolve(process.cwd(), path);

    if (FS.existsSync(path))
    {
        if (FS.lstatSync(path).isDirectory())
        {
            let file = 'surface.config.json';
            if (FS.existsSync(Path.join(path, file)))
                return Path.join(path, file);
            
            file = 'surface.config.js';            
            if (FS.existsSync(Path.join(path, file)))
                return Path.join(path, file);
                
            throw new Error('Surface configuration file not found');
        }
        
        return path;
    }
    else
        throw new Error('Surface configuration file not found');    
}

/**
 * Resolve entries.
 * @param entries Entries to be resolved.
 * @param context Context used to resolve entries.
 */
function resolveEntries(entries: Compiler.Entry, context: string): Compiler.Entry
{
    let result: Compiler.Entry = { };

    if (typeof entries == 'string')
    {
        entries = [entries]
    }

    if (Array.isArray(entries))
    {
        let tmp: Compiler.Entry = { };
        for (let entry of entries)
            tmp[Path.dirname(entry)] = entry;

        entries = tmp;
    }

    for (let key in entries)
    {
        let value   = entries[key];
        let sources = Array.isArray(value) ? value : [value];
        
        for (let source of sources)
        {
            if (source.endsWith('/*'))
                source = source.replace(/\/\*$/, '');

            let sourcePath = Path.resolve(context, source);

            if (FS.lstatSync(sourcePath).isDirectory())
            {
                FS.readdirSync(sourcePath)
                    .forEach
                    (
                        $module =>
                        {
                            let modulePath = Path.resolve(sourcePath, $module);
                            if (FS.existsSync(modulePath))
                            {
                                if(FS.lstatSync(modulePath).isDirectory())
                                {
                                    let index = FS.readdirSync(modulePath).filter(x => x.match(/index\.[tj]s/))[0];
                                    if (index)
                                    {
                                        result[`${key}/${$module}`] = `${source}/${$module}/${index}`;
                                    }
                                }
                                else
                                {
                                    setOrPush(result, key, `${source}/${$module}`);
                                }
                            }
                            else
                                throw new Error('Invalid path');
                        }
                    );
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
        target[key] = value;
    else if (!Array.isArray(target[key]))
        target[key] = [target[key]].concat(value) as Array<string>;
    else
        (target[key] as Array<string>).push(value);
}

export async function execute(task?: Enums.TasksType, config?: string, env?: string, watch?: boolean): Promise<void>
{
    task   = task || Enums.TasksType.build;
    config = config || './';

    let enviroment = Enums.EnviromentType.development;
    
    if (env == 'prod' || env == 'production')
        enviroment = Enums.EnviromentType.production;
    
    watch = !!watch;
    
    let wepackconfig = getConfig(config, enviroment);

    switch (task)
    {
        case Enums.TasksType.build:
            await build(wepackconfig, enviroment, watch);
            break;
        case Enums.TasksType.clean:
            await clean(wepackconfig);
            break;
        case Enums.TasksType.rebuild:
            await clean(wepackconfig);
            await build(wepackconfig, enviroment, watch);
            break;
    }
}