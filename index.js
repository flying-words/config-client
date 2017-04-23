var debug = require('debug')('limijiaoyin-config-client');
var objectPath = require('object-path');
var EventEmitter = require('events').EventEmitter;
var request = require('sync-request');
var fetch = require('node-fetch');

var loaderFactory = require('./configLoaderFactory');

const INTERVAL = 5000;
var emitter = new EventEmitter();
var loaded = false;
var data;
var internal = {
    host: null,
    token: null,
    env: null
};

function _loadAsync(host, token, env) {
    env = env || "application";
    debug('loading config data');
    return loaderFactory.getAsyncLoader().load(host, token, env);
}

function loadSync(host, token, env) {
    internal.env = env || "application";
    internal.host = host;
    internal.token = token;
    data = loaderFactory.getSyncLoader().load(internal.host, internal.token, internal.env);
    loaded = true;
    return data.config;
}

function _refreshConfigIfNeed(host, token, env) {
    return _loadAsync(host, token, env).then(_data => {
        if (_data.revision !== data.revision) {
            debug('config changed');
            data = _data;
            emitter.emit('change');
        }
    });
}

function watch() {
    function _tick() {
        _refreshConfigIfNeed(internal.host, internal.token, internal.env).then(() => {
            setTimeout(_tick, INTERVAL);
        }).catch(e => {
            debug(e);
            setTimeout(_tick, INTERVAL);
        });
    }

    _tick();
}

function mock(config) {
    if (!data) {
        data = { config };
        loaded = true;
    } else {
        data.config = Object.assign({}, data.config, config);
        loaded = true;
    }
}

function get(path) {
    if (!loaded) {
        // throw new Error('Config data has not beed loaded');
        return {};
    }

    return objectPath.get(data.config, path);
}

function reset() {
    data = null;
    loaded = false;
}

function _status() {
    return {
        data,
        loaded
    }
}

module.exports = {
    emitter,
    mock,
    loadSync,
    watch,
    reset,
    get,
    _refreshConfigIfNeed,
    _status
};
