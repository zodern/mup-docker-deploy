import { v4 } from 'uuid';
import { tmpdir } from 'os';
import { resolve } from 'path';
import { create } from 'random-seed';
import createBundle from './bundle';

function tmpBuildPath(appPath, api) {
  const rand = create(appPath);
  const uuidNumbers = [];
  for (let i = 0; i < 16; i++) {
    uuidNumbers.push(rand(255));
  }

  return api.resolvePath(
    tmpdir(),
    `mup-docker-deploy-${v4({ random: uuidNumbers })}`,
  );
}

export function setup(api, nodemiral) {
  const config = api.getConfig().app;

  if (!config) {
    console.log('error: no configs found for docker-deploy');
    process.exit(1);
  }

  const list = nodemiral.taskList('Setup for App');

  list.executeScript('Setup Envirnment', {
    script: api.resolvePath(__dirname, 'assets/setup.sh'),
    vars: {
      name: config.name,
    },
  });

  const sessions = api.getSessions(['app']);

  return api.runTaskList(list, sessions, {
    verbose: api.verbose,
  });
}

export function bundle(api) {
  const config = api.getConfig().app;
  const tmpPath = tmpBuildPath(config.path, api);

  return createBundle(config.path, tmpPath, api);
}

export function push(api, nodemiral) {
  const config = api.getConfig().app;
  const tmpPath = tmpBuildPath(config.path, api);
  const list = nodemiral.taskList('Pushing App');

  list.copy('Pushing app bundle to the server', {
    src: resolve(tmpPath, 'bundle.tar.gz'),
    dest: `/opt/${config.name}/tmp/bundle.tar.gz`,
    progressBar: true,
  });

  const sessions = api.getSessions(['app']);

  return api.runTaskList(list, sessions, {
    series: true,
    verbose: api.verbose,
  });
}

export function build(api, nodemiral) {
  const config = api.getConfig().app;
  const list = nodemiral.taskList('Building Docker Image');
  const sessions = api.getSessions(['app']);

  list.executeScript('Build Image', {
    script: api.resolvePath(__dirname, 'assets/build-image.sh'),
    vars: {
      appName: config.name,
    },
  });


  return api.runTaskList(list, sessions, {
    series: true,
    verbose: api.verbose,
  });
}

export function reconfig(api, nodemiral) {
  const list = nodemiral.taskList('Configuring App');
  const sessions = api.getSessions(['app']);
  const config = api.getConfig().app;
  const { env } = config;

  const publishedPort = env.PORT || 80;
  const exposedPort = 3000;

  env.PORT = exposedPort;

  list.copy('Sending Environment Variables', {
    src: api.resolvePath(__dirname, 'assets/env.list'),
    dest: `/opt/${config.name}/config/env.list`,
    vars: {
      env: env || {},
      appName: config.name,
    },
  });

  list.copy('Sending Start Script', {
    src: api.resolvePath(__dirname, 'assets/start.sh'),
    dest: `/opt/${config.name}/config/start.sh`,
    vars: {
      appName: config.name,
      docker: config.docker || {},
      publishedPort,
      exposedPort,
    },
  });

  return api.runTaskList(list, sessions, {
    series: true,
    verbose: api.verbose,
  });
}

export function start(api, nodemiral) {
  const config = api.getConfig().app;
  const sessions = api.getSessions(['app']);
  const list = nodemiral.taskList('Start App');

  list.executeScript('Start App', {
    script: api.resolvePath(__dirname, 'assets/run-start.sh'),
    vars: {
      appName: config.name,
    },
  });

  return api.runTaskList(list, sessions, {
    verbose: api.verbose,
  });
}

export function stop(api, nodemiral) {
  const appConfig = api.getConfig().app;
  const sessions = api.getSessions(['app']);
  const list = nodemiral.taskList('Stop App');

  list.executeScript('Stop App', {
    script: api.resolvePath(__dirname, 'assets/stop.sh'),
    vars: {
      appName: appConfig.name,
    },
  });

  return api.runTaskList(list, sessions, { verbose: api.verbose });
}

export function deploy(api) {
  return api.runCommand('docker-deploy.bundle')
    .then(() => api.runCommand('docker-deploy.push'))
    .then(() => api.runCommand('docker-deploy.build'))
    .then(() => api.runCommand('docker-deploy.reconfig'))
    .then(() => api.runCommand('docker-deploy.start'));
}

export function logs(api) {
  const config = api.getConfig().app;
  const args = api.getArgs();
  const sessions = api.getSessions(['app']);

  if (args[0] === 'docker-deploy') {
    args.shift();
  }

  return api.getDockerLogs(config.name, sessions, args);
}
