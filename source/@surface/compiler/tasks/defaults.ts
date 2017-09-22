import Path    = require('path');
import Webpack = require('webpack');

export let surface =
{
    context:    './',
    entry:      './',
    public:     './public',
    publicPath: './assets',
    filename:   '[name]/[hash].js',
    target:     'es6'
} as Surface.Compiler.Config;

export let webpack =
{
    devtool: '#source-map',
    output:
    {
        chunkFilename: '[name]'
    } as Webpack.Output,
    resolve:
    {
        extensions: ['.ts', '.js']
    } as Webpack.NewResolve,
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
    } as Webpack.Module,
    plugins: [ new Webpack.optimize.CommonsChunkPlugin({ name: '.' })]
} as Webpack.Configuration;

