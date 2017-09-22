#!/usr/bin/env node
import commander = require("commander");
import Tasks     = require("./tasks");

commander
  .version('0.0.1')
  .option('-c, --config <n>', 'Configuration file path')
  .option('-e, --env    <n>', 'Enviroment mode', /^(dev|development|prod|production)$/i)
  .option('-w, --watch', 'Watch mode compilation')
  .parse(process.argv);

  Tasks.build(commander.config, commander.env, commander.watch);