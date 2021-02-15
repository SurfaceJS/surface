#!/usr/bin/env node

import { toBoolean } from "../internal/common.js";
import Tasks         from "../internal/tasks.js";
import createProgram from "./create-program.js";

const program = createProgram()
    .option("--host              <n>", "Dev server hostname.")
    .option("--hot               [n]", "Enable hot reload.", toBoolean)
    .option("--port              <n>", "Dev server port.", Number)
    .action(x => void Tasks.serve(x));

program.parse(process.argv);