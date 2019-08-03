# mup-docker-deploy

Deploy using a custom `Dockerfile`.

This plugin is under development and is missing some features

## Getting started

Before starting, you should have a `Dockerfile` in your app's directory.

First, install mup and mup-docker-deploy with:

```bash
npm i -g mup mup-docker-deploy
```

Second, create a config with:
```bash
mup init
```

Open the config, and make the following adjustments:

Make sure to add to the plugins section:
- `plugins: ['mup-docker-deploy']`

For each server:
- host - Usually is the IP Address of the server
- server authentication - You can use a password or set pem to the path to a private key. If neither are set, it uses ssh-agent

In the `app` section:

- name: A unique name, with no spaces
- path: Path to the app, relative to the config.
- type: Set to `docker-image` to let mup know that this plugin will manage the app

For deploying from a docker repository:

- type: Set to `remote-image` to let mup know that this plugin will manage the app
- image: The name of your image with a tag, ex `mycompany/webapp:v3.1.0`

Third, setup the server. Mup will install everything needed to run the app. Run:

```bash
mup setup
```

Fourth, deploy the app. Run

```bash
mup deploy
```

Mup will upload your app, build the docker image, and run it.
