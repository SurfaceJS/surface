#!/usr/bin/env node

import { Command } from "commander";
import Tasks       from "../tasks";

const clean = new Command()
    .storeOptionsAsProperties(false)
    .action(() => void Tasks.clean());

clean.parse(process.argv);