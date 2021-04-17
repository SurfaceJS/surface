#!/usr/bin/env node
/* eslint-disable max-len */

import { toArray, toBoolean, toNumberOrBooleanOrStringArray } from "../internal/common.js";
import Tasks                                                  from "../internal/tasks.js";
import createProgram                                          from "./create-program.js";

const program = createProgram()
    .option("--compress                 [n]", "Enable gzip compression for everything served.", toBoolean)
    .option("--content-base             [n]", "Tell the server where to serve content from. This is only necessary if you want to serve static files. devServer.publicPath will be used to determine where the bundles should be served from, and takes precedence.", toNumberOrBooleanOrStringArray)
    .option("--content-base-public-path [n]", "Tell the server at what URL to serve `devServer.contentBase`. If there was a file `assets/manifest.json`, it would be served at `/serve-content-base-at-this-url/manifest.json`", toArray)
    .option("--index                    <n>", "The filename that is considered the index file.")
    .option("--host                     <n>", "Specify a host to use. By default this is localhost.")
    .option("--hot                      [n]", "Enable webpack's Hot Module Replacement feature.", toBoolean)
    .option("--hot-only                 [n]", "Enables Hot Module Replacement (see devServer.hot) without page refresh as fallback in case of build failures.", toBoolean)
    .option("--index                    <n>", "The filename that is considered the index file.")
    .option("--lazy                     [n]", "When lazy is enabled, the dev-server will only compile the bundle when it gets requested.", toBoolean)
    .option("--live-reload              [n]", "By default, the dev-server will reload/refresh the page when file changes are detected. devServer.hot option must be disabled or devServer.watchContentBase option must be enabled in order for liveReload to take effect. Disable devServer.liveReload by setting it to false.", toBoolean)
    .option("--open                     [n]", "When open is enabled, the dev server will open the browser.", toBoolean)
    .option("--open-page                <n>", "Specify a page to navigate to when opening the browser.", toArray)
    .option("--port                     <n>", "Specify a port number to listen for requests on.", Number)
    .option("--public                   <n>", "When using inline mode and you're proxying dev-server, the inline client script does not always know where to connect to.  It will try to guess the URL of the server based on window.location, but if that fails you'll need to use this.")
    .option("--quiet                    [n]", "With quiet enabled, nothing except the initial startup information will be written to the console.  This also means that errors or warnings from webpack are not visible.", toBoolean)
    .option("--use-local-ip             [n]", "This option lets the browser open with your local IP.", toBoolean)
    .option("--watch-content-base       [n]", "Tell the server to watch the files served by the devServer.contentBase option. File changes will trigger a full page reload.", toBoolean)
    .option("--write-to-disk            [n]", "Tells devServer to write generated assets to the disk.", toBoolean)
    .action(x => void Tasks.serve(x));

program.parse(process.argv);