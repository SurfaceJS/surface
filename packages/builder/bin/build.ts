#!/usr/bin/env node

import Commands      from "../internal/commands.js";
import { toBoolean } from "../internal/common.js";
import createProgram from "./create-program.js";

createProgram()
    .option("--watch                              [n]", "Enable Watch mode compilation.", toBoolean)
    .action(x => void Commands.build(x))
    .parse();