import FS   = require('fs');
import Path = require('path');

/**
 * Resolve 'node_modules' directory.
 * @param startPath Path to start resolution.
 */
export function resolveNodeModules(startPath: string): string
{
    let slices = startPath.replace(/\\/g, '/').split('/');

    while (slices.length > 0)
    {
        let path = Path.join(slices.join('/'), 'node_modules');

        if (FS.existsSync(path))
        {
            return path;
        }

        slices.pop();
    }

    throw new Error('Can\'t find node_modules on provided root path');
}