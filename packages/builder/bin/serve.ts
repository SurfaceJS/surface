#!/usr/bin/env node
/* eslint-disable max-len */

import Commands                                                               from "../internal/commands.js";
import { toBoolean, toBooleanOrEnum, toBooleanOrStringArray, toNumberOrEnum } from "../internal/common.js";
import createProgram                                                          from "./create-program.js";

createProgram()
    .option("--devserver-compress     [n]", "Enable gzip compression for everything served.", toBoolean)
    .option("--devserver-host         <n>", "Specify a host to use. By default this is localhost.")
    .option("--devserver-hot          [n]", "Enable webpack's Hot Module Replacement feature.", toBooleanOrEnum("auto"))
    .option("--devserver-live-reload  [n]", "By default, the dev-server will reload/refresh the page when file changes are detected. devServer.hot option must be disabled or devServer.watchContentBase option must be enabled in order for liveReload to take effect. Disable devServer.liveReload by setting it to false.", toBoolean)
    .option("--devserver-open         [n]", "When open is enabled, the dev server will open the browser.", toBooleanOrStringArray)
    .option("--devserver-port         <n>", "Specify a port number to listen for requests on.", toNumberOrEnum("auto"))
    .action(x => void Commands.serve(x))
    .parse(process.argv);