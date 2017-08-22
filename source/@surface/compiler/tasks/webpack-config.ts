import Webpack = require('webpack');
import Path    = require('path');

export = (path: string): Webpack.Configuration =>
{   
    let root       = process.cwd();
    let defaults   = require(Path.resolve(__dirname, '../surface.config.json')) as Surface.Config;
    let userConfig = require(Path.resolve(root, path))                          as Surface.Config;
    
    userConfig = Object.assign(defaults, userConfig);

    let config =
    {
        devtool: '#source-map',
        context: Path.resolve(root, userConfig.context),
        entry:   userConfig.entry,
        output:
        {
            path:          Path.resolve(root, userConfig.public),
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
                Path.resolve(root, userConfig.context)
            ].concat(userConfig.modules.map(x => Path.resolve(root, x)))
        } as Webpack.Resolve,
        resolveLoader:
        {
            modules:
            [
                Path.resolve(__dirname, '../node_modules')
            ]
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