import rimRaf  = require('rimraf');
import webpack = require('webpack');

import webpackConfig = require('./webpack-config');

export = function (configPath?: string, env?: string, watch?: boolean)
{
    if (configPath && configPath.endsWith('/'))    
        configPath = `${configPath}surface.config.json`;
    else
        configPath = './surface.config.json';

    env   = env || 'dev';
    watch = !!watch;

    let config = webpackConfig(configPath);

    let compiler = webpack(config);

    let statOptions: webpack.Stats.ToStringOptions =
    {
        assets:   true,
        version:  true,
        colors:   true,
        warnings: true,
        errors:   true
    };

    let callback: webpack.Compiler.Handler =
        (error, stats) => error ? console.log(error.message) : console.log(stats.toString(statOptions));

    console.log(`Starting ${watch ? 'Watch' : 'build'} using ${env} configuration.`);

    rimRaf
    (
        config.output.path,
        () =>
        {
            if (watch)
                compiler.watch({aggregateTimeout: 500, poll: true, ignored: /node_modules/ }, callback);
            else
                compiler.run(callback);
        }
    );
}
