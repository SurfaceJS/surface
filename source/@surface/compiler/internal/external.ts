/* istanbul ignore file */

import fs                                      from "fs";
import { isFile, lookupFile, removePathAsync } from "@surface/io";
import webpack                                 from "webpack";
import WebpackDevServer                        from "webpack-dev-server";

export async function loadModule(module: string): Promise<object>
{
    return import(module);
}

export { fs, isFile, lookupFile, removePathAsync, webpack, WebpackDevServer };