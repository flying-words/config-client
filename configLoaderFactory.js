var fetch = require('node-fetch');
var request = require('sync-request');

var syncLoader, asyncLoader;
const SCHEME = 'https';

class DefaultSyncLoader {
    load(host, token, env) {
        var res = request('GET', `${SCHEME}://${host}/config/${env}`, {
            'headers': {
                'X-CLIENT-TOKEN': token
            }
        });

        if (res.statusCode !== 200) {
            throw new Error(`api error, response: ${res.body}`);
        }

        return JSON.parse(res.getBody('utf-8'));
    }
}

class DefaultAsyncLoader {
    load(host, token, env) {
        return fetch(`${SCHEME}://${host}/config/${env}`, {
            headers: {
                'X-CLIENT-TOKEN': token
            }
        }).then(res => {
            if (!res.ok) {
                return res.text().then(content => {
                    throw new Error(`api error, response: ${content}`);
                });
            }

            return res.json();
        });
    }
}

syncLoader = new DefaultSyncLoader();
asyncLoader = new DefaultAsyncLoader();

module.exports._setSyncLoader = loader => syncLoader = loader;
module.exports.getSyncLoader = () => syncLoader;

module.exports._setAsyncLoader = loader => asyncLoader = loader;
module.exports.getAsyncLoader = () => asyncLoader;

module.exports._reset = () => {
    syncLoader = new DefaultSyncLoader();
    asyncLoader = new DefaultAsyncLoader();
}
