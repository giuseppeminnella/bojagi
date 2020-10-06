/* eslint-disable import/first */
import setEnv from './setEnv';

setEnv(); // set before the rest is loaded

import bundle from './commands/bundle';
import deploy from './commands/deploy';
import upload from './commands/upload';
import preview from './commands/preview';
import scan from './commands/scan';
import cleanup from './commands/cleanup';
import init from './commands/init';
import docs from './commands/docs';

const packageJson = require('../package.json');

import program = require('commander');

program.version(packageJson.version);

bundle(program);
deploy(program);
upload(program);
preview(program);
scan(program);
cleanup(program);
init(program);
docs(program);

program.on('command:*', operands => {
  console.error(`error: unknown command '${operands[0]}'`);
  const availableCommands = program.commands.map(cmd => cmd.name());
  console.error(`available commands are:\n\n${availableCommands.map(c => `  - ${c}`).join('\n')}`);
  process.exitCode = 1;
});

program.parse(process.argv);
