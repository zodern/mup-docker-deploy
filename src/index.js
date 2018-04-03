import * as _commands from './commands';
import validator from './validate';

export const name = 'docker-deploy';
export const description = 'Deploy an app using a docker image';

export const commands = _commands;

export const validate = {
  app: validator,
};

function runIfEnabled(...commandList) {
  return function run(api) {
    if (api.getConfig().app && api.getConfig().app.type === 'docker-image') {
      return commandList.reduce(
        (promise, command) => promise.then(() => api.runCommand(command)),
        Promise.resolve(),
      );
    }
  };
}

export const hooks = {
  'post.default.setup': runIfEnabled('docker-deploy.setup'),
  'post.default.deploy': runIfEnabled('docker-deploy.deploy'),
  'post.default.reconfig': runIfEnabled('docker-deploy.reconfig', 'docker-deploy.start'),
  'post.default.start': runIfEnabled('docker-deploy.start'),
  'post.default.stop': runIfEnabled('docker-deploy.stop'),
  'post.default.logs': runIfEnabled('docker-deploy.logs'),
};
