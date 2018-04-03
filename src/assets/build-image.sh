#!/bin/bash
set -e

APPNAME=<%= appName %>
APP_DIR=/opt/$APPNAME
IMAGE=mup-<%= appName.toLowerCase() %>

cd $APP_DIR/tmp
sudo rm -rf bundle
mkdir bundle
sudo tar -xzf bundle.tar.gz -C bundle
sudo chmod 777 ./ -R
cd bundle

sudo chmod 777 ./Dockerfile

echo "Building image"

sudo docker build -t $IMAGE:build .

sudo docker tag $IMAGE:latest $IMAGE:previous || true
sudo docker tag $IMAGE:build $IMAGE:latest

sudo docker image prune -f
