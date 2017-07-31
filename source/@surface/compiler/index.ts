#!/usr/bin/env node
import commander = require("commander");
import build     = require("./tasks/build");

commander
  .version('0.1.0')
  .option('-c, --config <n>', 'Configuration file path')
  .option('-e, --env    <n>', 'Enviroment mode', /^(dev|development|prod|production)$/i)
  .option('-w, --watch', 'Watch mode compilation')
  .parse(process.argv);

build(commander.config, commander.env, commander.watch);