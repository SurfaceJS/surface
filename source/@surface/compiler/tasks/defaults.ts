import ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
import Path                       = require('path');
import Webpack                    = require('webpack');

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
        modules: ['node_modules', Path.resolve(__dirname, '../node_modules')]
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
                use:
                [
                    { loader: 'cache-loader' },
                    {
                        loader: 'thread-loader',
                        options:
                        {
                          // there should be 1 cpu for the fork-ts-checker-webpack-plugin
                          workers: require('os').cpus().length - 1,
                        },
                    },
                    {
                        loader: 'ts-loader',
                        options: { transpileOnly: true, happyPackMode: false }
                    }
                ]
            },
        ] as Array<Webpack.Rule>,
    } as Webpack.Module,
    plugins:
    [
        new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
        new Webpack.optimize.CommonsChunkPlugin({ name: '.' }),
    ]
} as Webpack.Configuration;