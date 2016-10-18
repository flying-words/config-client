var objectPath = require('object-path');
var fetch = require('node-fetch');

var loaded = false;
var data;

function load(hostname, token, env) {
	console.log('loading config data')
    loaded = false;
    return fetch(`http://${hostname}/config/${env}`, {
        headers: {
            'X-CLIENT-TOKEN': token
        }
    }).then(res => {
        if (!res.ok) {
            return res.text().then(content => {
                throw new Error(`fail to get config, response: ${content}`);
            });
        }

        return res.json();
    }).then(_data => {
        loaded = true;
        data = _data;
    });
}

function get(path) {
    if (!loaded && !data) {
        throw new Error('Config data has not beed loaded');
    }

    return objectPath.get(data, path);
}

module.exports = {
    load,
    get
};
