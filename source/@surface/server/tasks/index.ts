import { Host }                from '../library/host';
import { ServerConfiguration } from '../library/server-configuration';
import { resolveFile }         from '@surface/common';
import * as path               from 'path';

export async function execute(configPath?: string): Promise<void>
{
    configPath = configPath || './';
    configPath = resolveFile(process.cwd(), configPath, 'surface-server.config');

    let config = new ServerConfiguration(path.dirname(configPath), require(configPath));
    
    Host.run(config);
}