/* istanbul ignore file */

import { lookupFile, removePathAsync } from "@surface/io";
import webpack                         from "webpack";
import WebpackDevServer                from "webpack-dev-server";

export async function loadModule(module: string): Promise<object>
{
    return import(module);
}

export { lookupFile, removePathAsync, webpack, WebpackDevServer };