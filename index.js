var objectPath = require('object-path');
var request = require('sync-request');
var fetch = require('node-fetch');

var loaderFactory = require('./configLoaderFactory');

var loaded = false;
var data;

function load(host, token, env) {
    env = env || "application";
    console.log('loading config data')
    return loaderFactory.getAsyncLoader().load(host, token, env).then(_data => {
        loaded = true;
        data = _data;
        return data;
    });
}

function loadSync(host, token, env) {
    env = env || "application";
    data = loaderFactory.getSyncLoader().load(host, token, env);
    loaded = true;
    return data;
}

function mock(_data) {
    data = _data;
    loaded = true;
}

function get(path) {
    if (!loaded) {
        throw new Error('Config data has not beed loaded');
    }

    return objectPath.get(data, path);
}

module.exports = {
    mock,
    load,
    loadSync,
    get
};
