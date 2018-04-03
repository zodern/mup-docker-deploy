import * as handlers from './command-handlers';

export const setup = {
  description: 'Prepare server to run the app',
  handler: handlers.setup,
};

export const deploy = {
  description: 'Deploy app',
  handler: handlers.deploy,
};

export const build = {
  description: 'Build the docker image',
  handler: handlers.build,
};

export const reconfig = {
  description: 'Reconfig the app',
  handler: handlers.reconfig,
};

export const start = {
  description: 'Start the app',
  handler: handlers.start,
};

export const stop = {
  description: 'Stop the app',
  handler: handlers.stop,
};

export const logs = {
  description: 'View the app\'s logs',
  builder(yargs) {
    return yargs
      // Since any docker log option is allowed, disable validating options
      .strict(false)
      .option('tail', {
        description: 'Number of lines to show from the end of the logs',
        alias: 't',
        number: true,
      })
      .option('follow', {
        description: 'Follow log output',
        alias: 'f',
        boolean: true,
      });
  },
  handler: handlers.logs,
};

// Hidden commands

export const bundle = {
  description: false,
  handler: handlers.bundle,
};

export const push = {
  description: false,
  handler: handlers.push,
};
