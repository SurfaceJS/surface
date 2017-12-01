import * as path    from 'path';
import * as webpack from 'webpack';

export let loaders =
{
    cacheLoader: { loader: 'cache-loader', options: { cacheDirectory: path.resolve(__dirname, 'cache-loader') }},
    cssLoader:   { loader: 'css-loader' },
    fileLoader:
    {
        loader: 'file-loader',
        options: { name: '/resources/[hash].[ext]' }
    },
    htmlLoader:
    {   
        loader: 'html-loader',
        options:
        {
            attrs: ['img:src', 'link:href', 'script:src'],
            minify: true
        }
    },
    sassLoader: { loader: 'sass-loader' },
    threadLoader:
    {
        loader: 'thread-loader',
        options:
        {
          // there should be 1 cpu for the fork-ts-checker-webpack-plugin
          workers: require('os').cpus().length - 1,
        },
    },
    toStringLoader: { loader: 'to-string-loader' },
    tsLoader:
    {
        loader: 'ts-loader',
        options:
        {
            configFile:    'tsconfig.json',
            happyPackMode: true,
            transpileOnly: true
        }
    },
};

export let webpackConfig =
{
    devtool: '#source-map',
    resolve:
    {
        extensions: ['.ts', '.js'],
        modules:    ['.', 'node_modules']
    },
    resolveLoader:
    {
        modules: ['node_modules', path.resolve(__dirname, '../node_modules')]
    },
    module:
    {
        rules:
        [
            {
                test: /\.(png|jpe?g|svg)$/,
                use:  [loaders.fileLoader]
            },
            {
                test: /\.s[ac]ss$/,
                use:
                [   
                    loaders.toStringLoader,
                    loaders.cssLoader,
                    loaders.sassLoader
                ]
            },
            {
                test: /\.html$/,
                use: [loaders.htmlLoader]
            },
            {
                test: /\.ts$/,
                use:
                [
                    loaders.cacheLoader,
                    loaders.threadLoader,
                    loaders.tsLoader
                ]
            },
        ],
    }    
} as webpack.Configuration;