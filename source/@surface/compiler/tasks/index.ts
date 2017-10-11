import FS      = require('fs');
import Path    = require('path');
import RimRaf  = require('rimraf');
import Webpack = require('webpack');

import Common = require('./common');
import Enums  = require('./enums');

/**
 * Build Surface project using provided configuration.
 * @param configPath Path to Surface config file.
 * @param env        Enviroment variable.
 * @param watch      Enable watch mode.
 */
export function build(configPath?: string, env?: string, watch?: boolean)
{
    let enviroment = Enums.Enviroment.development;

    if (env == 'prod' || env == 'production')
        enviroment = Enums.Enviroment.production;

    watch = !!watch;

    let { root, file } = resolveConfig(configPath);

    let config = Common.getConfig(root, file, enviroment);

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

    RimRaf
    (
        config!.output!.path!,
        () =>
        {
            if (watch)
                compiler.watch({ aggregateTimeout: 500, poll: true, ignored: /node_modules/ }, callback);
            else
                compiler.run(callback);
        }
    );
}

/**
 * Resolve Surface config.
 * @param path Path to Surface config file.
 */
function resolveConfig(path?: string): { root: string, file: string }
{
    if (!path)
        path = './';

    path = Path.resolve(process.cwd(), path);

    if (FS.lstatSync(path).isDirectory())
    {
        let root = path;
        let file = 'surface.config.json'
        if (FS.existsSync(Path.join(path, file)))
            return { root, file };

        file = 'surface.config.js'
        if (FS.existsSync(Path.join(path, file)))
            return { root, file };

        throw new Error('Surface configuration file not found');
    }
    else if (FS.existsSync(path))
    {
        let slices = path.replace(/\\/g, '/').split('/');
        let file   = slices.pop() as string;
        let root   = slices.join('/');

        return { root, file };
    }
    else
        throw new Error('Surface configuration file not found');
}