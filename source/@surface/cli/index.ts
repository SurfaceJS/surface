#!/usr/bin/env node
import Compiler = require("@surface/compiler");

Compiler("./surface.config.json", "dev", false);
