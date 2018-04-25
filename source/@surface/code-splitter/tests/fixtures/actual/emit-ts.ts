// File generated automatically. Don't change.

/**
 * Requires the module of the specified path.
 * @param path Path to the module.
 */
export async function load(path: string): Promise<Object>
{
    switch (path)
    {
        case "ts-modules/module-a":
            return import(/* webpackChunkName: "ts-modules/module-a" */ "../ts-modules/module-a");
        case "ts-modules/module-b":
            return import(/* webpackChunkName: "ts-modules/module-b" */ "../ts-modules/module-b");
        case "ts-modules/module-c":
            return import(/* webpackChunkName: "ts-modules/module-c" */ "../ts-modules/module-c");
        default:
            return Promise.reject("path not found");
    }
}