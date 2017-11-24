import { Constructor } from '@surface/types';

/**
 * Load code splitted modules
 * @param name Module to load
 */
export function load<T>(name: string): Promise<Constructor<T>>
{
    throw new Error('Run code splitter plugin');
}