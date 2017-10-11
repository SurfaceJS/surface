import { Nullable } from '@surface/core/typings';

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

export function getParentPath(path: string): Nullable<string>
{
    let dirName = Path.dirname(path);
    if (!dirName)
        throw new Error('Invalid path.')
    
    return dirName.split(Path.sep).pop();
}

export function objectMerge<TTarget = object, TSource = object>(target: TTarget, source: Array<TSource>): TTarget & TSource;
export function objectMerge<TTarget = object, TSource = object>(target: TTarget, source: Array<TSource>, combineArrays: boolean): TTarget & TSource;
export function objectMerge<TTarget = object, TSource = object>(target: TTarget, source: TSource): TTarget & TSource;
export function objectMerge<TTarget = object, TSource = object>(target: TTarget, source: TSource, combineArrays: boolean): TTarget & TSource;
export function objectMerge<TTarget = object, TSource = object>(target: TTarget, source: TSource|Array<TSource>, combineArrays?: boolean): TTarget & TSource
{
    if (!target)
        throw new TypeError('target can\'t be null s');

    if (!source)
        throw new TypeError('source can\'t be null s');

    combineArrays = !!combineArrays;
    
    if (!Array.isArray(source))
        source = [source];

    for (let current of source)
    {
        for (let key of Object.keys(current))
        {
            if (!current[key])
                continue;
                
            if (target[key] && target[key] instanceof Object)
            {
                if (Array.isArray(target[key]) && Array.isArray(current[key]) && combineArrays)
                {
                    target[key] = target[key].concat(current[key]);
                }
                else if (target[key] instanceof Object && current[key] instanceof Object && target[key].constructor.name == 'Object' && current[key].constructor.name == 'Object')
                {
                    target[key] = objectMerge(target[key], current[key], combineArrays);
                }
                else if (current[key])
                {
                    var descriptor = Object.getOwnPropertyDescriptor(current, key);
                    
                    if (descriptor && descriptor.enumerable)
                        target[key] = current[key];
                }
            }
            else if (current[key])
            {
                var descriptor = Object.getOwnPropertyDescriptor(current, key);

                if (descriptor && descriptor.enumerable)
                    target[key] = current[key];
            }
        }
    }

    return target as TTarget & TSource;
}