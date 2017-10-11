import { Constructor } from '@surface/core/typings';
import { Compiler }    from '@surface/compiler/typings';

import Common         = require('@surface/common');
import FS             = require('fs');
import Path           = require('path');
import UglifyJsPlugin = require('uglifyjs-webpack-plugin');
import Webpack        = require('webpack');
import Defaults       = require('./defaults');
import Enums          = require('./enums');

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
export function getConfig(path: string, file: string, env: Enums.Enviroment): Webpack.Configuration
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

    let nodeModules = Common.resolveNodeModules(config.context);

    let primaryConfig =
    {
        context: config.context,
        entry:   config.entry,
        output:
        {
            path:     config.public,
            filename: config.filename
        },
        resolve:
        {
            modules: ['.', config.context, nodeModules]
        },
        plugins: getSurfacePlugins(config.plugins || [], nodeModules)
    } as Webpack.Configuration; Webpack.optimize.UglifyJsPlugin

    webpack = Common.objectMerge(webpack, [userWebpack, primaryConfig], true);

    if (env == Enums.Enviroment.production && webpack.plugins)
        webpack.plugins = webpack.plugins.concat(new UglifyJsPlugin({ parallel: true, extractComments: true, uglifyOptions: { ecma: 6 }}));

    return webpack;
}

/**
 * Require Surface's plugins.
 * @param plugins         Plugins to be required.
 * @param nodeModulesPath Path to 'node_modules' folder.
 */
export function getSurfacePlugins(plugins: Array<Compiler.Plugin>, nodeModulesPath: string): Array<Webpack.Plugin>
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