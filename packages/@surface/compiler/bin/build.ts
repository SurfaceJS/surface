#!/usr/bin/env node

import type { Command }                 from "commander";
import { parsePattern, toBoolean }      from "../internal/common.js";
import { logLevelPattern, modePattern } from "../internal/patterns.js";
import Tasks                            from "../internal/tasks.js";
import createProgram                    from "./create-program.js";

const program = createProgram()
    .option("--log-level         <n>", "Output verbosity level. Can be 'none', 'summary', 'errors-only', 'errors-warnings', 'minimal', 'normal', 'detailed', 'verbose'.", parsePattern(logLevelPattern))
    .option("--mode              <n>", "Enable production optimizations or development hints.", parsePattern(modePattern))
    .option("--watch             [n]", "Enable Watch mode compilation.", toBoolean)
    .action((command: Command) => void Tasks.build(command.opts()));

program.parse(process.argv);