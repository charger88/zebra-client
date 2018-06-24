# Zebra Sharing System

Zebra Sharing System is open-source software for secured data exchange. You can run it and as docker containers or as regular software. 

## Components

* Zebra API - Go app, which handles server-side part of the functionality. https://github.com/charger88/zebra-api
* Zebra Client - HTML single page app which may be served by web server or may be opened as HTML file from local disc. https://github.com/charger88/zebra-client
* Zebra docker images - possible way to run Zebra API and Zebra Client. https://github.com/charger88/zebra-docker

# Zebra Client

## How to run it

There are two way to run it. 

First one is via web server. Example of _nginx_ configuration: https://github.com/charger88/zebra-docker/blob/master/zebra-client/default.conf

The other way is to run it in browser from hard disk, but in that case client will ask for API URL or you can provide API URL as query string like: `file:///zebra-client/index.html?http://127.0.0.1:8080`. If you run client not via HTTPS, it also will ask to provide API URL.