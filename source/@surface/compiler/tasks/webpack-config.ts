import Common  = require('@surface/common');
import FS      = require('fs');
import Path    = require('path');
import Webpack = require('webpack');

export = (path: string): Webpack.Configuration =>
{   
    let root       = process.cwd();
    let defaults   = require(Path.resolve(__dirname, '../surface.config.json')) as Surface.Config;
    let userConfig = require(Path.resolve(root, path))                          as Surface.Config;
    
    contextualize(userConfig);

    userConfig = Object.assign(defaults, userConfig);

    let config =
    {
        devtool: '#source-map',
        context: userConfig.context,
        entry:   userConfig.entry,
        output:
        {
            path:          userConfig.public,
            publicPath:    userConfig.publicPath,
            filename:      userConfig.filename,
            libraryTarget: userConfig.libraryTarget
        } as Webpack.Output,
        resolve:
        {
            extensions: ['.ts', '.js'],
            modules:
            [
                '.',
                userConfig.context
            ].concat(userConfig.modules)
        } as Webpack.Resolve,
        resolveLoader:
        {
            modules: [Path.resolve(__dirname, '../node_modules')]
        } as Webpack.ResolveLoader,
        module:
        {
            rules:
            [
                {
                    test: /\.(png|jpe?g|svg)$/,
                    use:
                    [
                        {
                            loader: 'file-loader',
                            options: { name: '/resources/[hash].[ext]' }
                        }
                    ]
                },
                {
                    test: /\.s[ac]ss$/,
                    use:
                    [
                        { loader: 'to-string-loader' },
                        { loader: 'css-loader' },
                        { loader: 'sass-loader' }
                    ]
                },
                {
                    test: /\.html$/,
                    use:
                    [
                        {   
                            loader: 'html-loader',
                            options:
                            {
                                attrs: ['img:src', 'link:href', 'script:src'],
                                minify: true
                            }
                        }
                    ]
                },
                {
                    test: /\.ts$/,
                    use: [{ loader: 'ts-loader' }]
                },
            ] as Array<Webpack.Rule>,
        } as Webpack.Module
    } as Webpack.Configuration;

    let plugins: Array<Webpack.Plugin> = [];

    for (let plugin of userConfig.plugins)
    {
        if (!plugin.name.endsWith("-plugin"))
            plugin.name = `${plugin.name}-plugin`;

        let TargetPlugin = require(Path.resolve(root, `node_modules/@surface/${plugin.name}`)) as Surface.Plugin;
        plugins.push(new TargetPlugin(plugin.options));
    }

    config.plugins = plugins;

    return config;
}

function contextualize(config: Surface.Config): void
{
    let root = process.cwd();
    config.context = Path.resolve(root, config.context);
    config.public  = Path.resolve(root, config.public);
    config.modules = config.modules.map(x => Path.resolve(root, x));

    config.entry = resolveEntries(config.entry, config.context);
}

function resolveEntries(entries: Surface.Entry, context: string): Surface.Entry
{
    let result: Surface.Entry = { };

    if (typeof entries == 'string')
    {
        entries = [entries]
    }

    if (Array.isArray(entries))
    {
        let tmp: Surface.Entry = { };        
        for (let entry of entries)
            tmp[Common.getModule(entry)] = entry;

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

function setOrPush(target: Surface.Entry, key: string, value: string): void
{
    if (!target[key])
        target[key] = value;
    else if (!Array.isArray(target[key]))
        target[key] = [target[key]].concat(value) as Array<string>;
    else
        (target[key] as Array<string>).push(value);
}