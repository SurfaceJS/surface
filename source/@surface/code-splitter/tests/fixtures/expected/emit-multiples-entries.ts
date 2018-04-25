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
        case "ts-modules/deeper-modules/module-d":
            return import(/* webpackChunkName: "ts-modules/deeper-modules/module-d" */ "../ts-modules/deeper-modules/module-d");
        case "ts-modules/deeper-modules/module-e":
            return import(/* webpackChunkName: "ts-modules/deeper-modules/module-e" */ "../ts-modules/deeper-modules/module-e");
        case "ts-modules/deeper-modules/module-f":
            return import(/* webpackChunkName: "ts-modules/deeper-modules/module-f" */ "../ts-modules/deeper-modules/module-f");
        case "ts-modules/deeper-modules/simbling":
            return import(/* webpackChunkName: "ts-modules/deeper-modules/simbling" */ "../ts-modules/deeper-modules/simbling");
        default:
            return Promise.reject("path not found");
    }
}