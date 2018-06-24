// File generated automatically. Don't change.

/**
 * Requires the module of the specified path.
 * @param {string} path Path to the module.
 * @returns {Promise}
 */
export async function load(path)
{
    switch (path)
    {
        case "js-modules/module-a":
            return import(/* webpackChunkName: "js-modules/module-a" */ "../js-modules/module-a");
        case "js-modules/module-b":
            return import(/* webpackChunkName: "js-modules/module-b" */ "../js-modules/module-b");
        case "js-modules/module-c":
            return import(/* webpackChunkName: "js-modules/module-c" */ "../js-modules/module-c");
        default:
            return Promise.reject("path not found");
    }
}