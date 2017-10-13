#!/usr/bin/env node
import commander = require('commander');
import Tasks     = require('./tasks');

commander
  .version('0.0.1')
  .option('-c, --config <n>', 'Configuration file path')
  .option('-e, --env    <n>', 'Enviroment mode', /^(dev|development|prod|production)$/i)
  .option('-t, --task   <n>', 'Task to be executed', /^build|clean|rebuild$/, 'build')
  .option('-w, --watch'     , 'Watch mode compilation', /true|false/)
  .parse(process.argv);

  Tasks.execute(commander.task, commander.config, commander.env, commander.watch);