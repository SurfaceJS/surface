import { Compiler } from '@surface/compiler/typings';

import Common   = require('@surface/common');
import FS       = require('fs');
import Path     = require('path');
import Webpack  = require('webpack');
import Defaults = require('./defaults');

/**
 * Contextualizes paths referring to the module client.
 * @param config  Config to be contextualized.
 * @param context Context relative to Surface config.
 */
export function contextualize(config: Compiler.Config, context: string): void
{
    config.context = Path.resolve(context, config.context);
    config.public  = Path.resolve(context, config.public);
    config.entry   = resolveEntries(config.entry, config.context);
}

/**
 * Get Webpack config based on Surface config.
 * @param path Path to Surface config.
 * @param env  Enviroment variable.
 */
export function getConfig(path: string, file: string, env: string): Webpack.Configuration
{
    let config = require(Path.join(path, file)) as Compiler.Config;
    
    contextualize(config, path);
    
    let userWebpack: Webpack.Configuration = { };
    let webpack = Defaults.webpack;

    if (config.webpack)
    {
        if(typeof config.webpack == 'string' && FS.existsSync(config.webpack))
            userWebpack = require(config.webpack) as Webpack.Configuration;
        else
            userWebpack = config.webpack as Webpack.Configuration;
    }

    webpack = Object.assign(webpack, userWebpack);
    
    let nodeModules = Common.resolveNodeModules(config.context);

    webpack.output        = (webpack.output        as Webpack.Output);
    webpack.module        = (webpack.module        as Webpack.NewModule);
    webpack.resolve       = (webpack.resolve       as Webpack.NewResolve);
    webpack.resolveLoader = (webpack.resolveLoader as Webpack.NewResolveLoader);

    userWebpack.module        = (userWebpack.module        as Webpack.NewModule);
    userWebpack.resolve       = (userWebpack.resolve       as Webpack.NewResolve);
    userWebpack.resolveLoader = (userWebpack.resolveLoader as Webpack.NewResolveLoader);

    webpack.context         = config.context;
    webpack.entry           = config.entry;
    webpack.output.path     = config.public;
    webpack.output.filename = config.filename;

    webpack.resolve.modules =
    [
        '.',
        config.context,
        nodeModules
    ];

    if (userWebpack.resolve && userWebpack.resolve.modules)
        webpack.resolve.modules = webpack.resolve.modules.concat(userWebpack.resolve.modules);

    if (webpack.resolve.extensions && userWebpack.resolve && userWebpack.resolve.extensions)
        webpack.resolve.extensions = webpack.resolve.extensions.concat(userWebpack.resolve.extensions);

    if (webpack.resolveLoader && userWebpack.resolveLoader && userWebpack.resolveLoader.modules)
        webpack.resolveLoader.modules = webpack.resolve.modules.concat(userWebpack.resolveLoader.modules);
    
    if (webpack.plugins && config.plugins)
        webpack.plugins = webpack.plugins.concat(getPlugins(config.plugins, nodeModules));

    if (webpack.plugins && userWebpack.plugins)
        webpack.plugins = webpack.plugins.concat(userWebpack.plugins);

    if (webpack.module && userWebpack.module)
        webpack.module.rules = webpack.module.rules.concat(userWebpack.module.rules);

    return webpack;
}

/**
 * Require Surface's plugins.
 * @param plugins         Plugins to be required.
 * @param nodeModulesPath Path to 'node_modules' folder.
 */
export function getPlugins(plugins: Array<Compiler.Plugin>, nodeModulesPath: string): Array<Webpack.Plugin>
{    
    let result: Array<Compiler.Plugin> = [];
    
    for (let plugin of plugins)
    {
        if (!plugin.name.endsWith("-plugin"))
            plugin.name = `${plugin.name}-plugin`;
        
        let Plugin = require(Path.resolve(nodeModulesPath, `@surface/${plugin.name}`)) as Compiler.Plugin;
        result.push(new Plugin(plugin.options));
    }

    return result;
}

/**
 * Resolve entries.
 * @param entries Entries to be resolved.
 * @param context Context used to resolve entries.
 */
export function resolveEntries(entries: Compiler.Entry, context: string): Compiler.Entry
{
    let result: Compiler.Entry = { };

    if (typeof entries == 'string')
    {
        entries = [entries]
    }

    if (Array.isArray(entries))
    {
        let tmp: Compiler.Entry = { '.': [] };
        for (let entry of entries)
            tmp['.'].push(entry);

        entries = tmp;
    }

    for (let key in entries)
    {
        let value   = entries[key];
        let sources = Array.isArray(value) ? value : [value];
        
        for (let source of sources)
        {
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
export function setOrPush(target: Compiler.Entry, key: string, value: string): void
{
    if (!target[key])
        target[key] = value;
    else if (!Array.isArray(target[key]))
        target[key] = [target[key]].concat(value) as Array<string>;
    else
        (target[key] as Array<string>).push(value);
}