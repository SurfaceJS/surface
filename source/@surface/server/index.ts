#!/usr/bin/env node
import * as tasks     from './tasks';
import * as commander from 'commander';

commander
  .version('0.0.1')
  .option('-c, --config <n>', 'Configuration file path')
  .parse(process.argv);

  tasks.execute(commander.task);