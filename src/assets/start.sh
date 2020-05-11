#!/bin/bash
set -e
set -x

APPNAME=<%= appName %>
APP_PATH=/opt/$APPNAME
ENV_FILE=$APP_PATH/config/env.list
APP_IMAGE=<%= image %>
BIND="0.0.0.0"
PUBLISHED_PORT=<%= publishedPort %>
EXPOSED_PORT=<%= exposedPort %>

sudo docker rm -f $APPNAME || true
sudo docker network disconnect bridge -f $APPNAME || true

sudo docker run \
  -d \
  --restart=always \
  --publish=$BIND:$PUBLISHED_PORT:$EXPOSED_PORT \
  --hostname="$HOSTNAME-$APPNAME" \
  --env-file=$ENV_FILE \
  --name=$APPNAME \
  <% for(var args in docker.args) { %> <%- docker.args[args] %> <% } %> \
  <% for(var volume in volumes) { %>-v <%= volume %>:<%= volumes[volume] %> <% } %> \
  $APP_IMAGE

echo "Started app's container"

<% for(var network in docker.networks) { %>
  sudo docker network connect <%=  docker.networks[network] %> $APPNAME
<% } %>

# When using a private docker registry, the cleanup run when 
# building the image is only done on one server, so we also
# cleanup here so the other servers don't run out of disk space
<% if (privateRegistry) { %>
  echo "pruning images"
  sudo docker image prune -f || true
<% } %>
