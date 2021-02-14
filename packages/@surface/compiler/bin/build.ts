#!/usr/bin/env node

import { parsePattern, toBoolean }      from "../internal/common.js";
import { logLevelPattern, modePattern } from "../internal/patterns.js";
import Tasks                            from "../internal/tasks.js";
import createProgram                    from "./create-program.js";

const program = createProgram()
    .option("--log-level         <n>", "Output verbosity level. Can be 'detailed', 'errors-only', 'errors-warnings', 'minimal', 'none', 'normal', 'summary' or 'verbose'.", parsePattern(logLevelPattern))
    .option("--mode              <n>", "Enable production optimizations or development hints.", parsePattern(modePattern))
    .option("--watch             [n]", "Enable Watch mode compilation.", toBoolean)
    .action(x => void Tasks.build(x));

program.parse(process.argv);