var configLoaderFactory = require('../configLoaderFactory');
var config = require('../index');

var assert = require('assert');

describe('config', () => {
    var originAsyncLoader, originSyncLoader;

    before(() => {
        originSyncLoader = configLoaderFactory.getSyncLoader();
        originAsyncLoader = configLoaderFactory.getAsyncLoader();

        var configData = {
            hello: 'world',
            mongodb: {
                host: 'localhost',
                port: 27017
            }
        };


        configLoaderFactory._setSyncLoader({
            load: () => configData
        });

        configLoaderFactory._setAsyncLoader({
            load: () => Promise.resolve(configData)
        });
    });

    after(() => {
        configLoaderFactory._setSyncLoader(originSyncLoader);
        configLoaderFactory._setAsyncLoader(originAsyncLoader);
    });

    it('should throw an exception if config not loaded', () => {
        try {
            config.get('hello');
            throw new Error('not throw error');
        } catch (e) {
            // nothing to do
        }
    });

    it('should support load data sync', () => {
        config.loadSync();
        assert.equal(config.get('hello'), 'world');
    });

    it('should support load data async', done => {
        config.load().then(() => {
            assert.equal(config.get('hello'), 'world');
            done();
        }).catch(done);
    });

    it('should support get property by path', () => {
        config.loadSync();
        assert.equal(config.get('mongodb.port'), 27017);
    });

    describe('#mock', () => {
    	it('should support mock local data as config', () => {
    		config.mock({
    			mysql: {
    				host: '192.168.1.4',
    				port: 3306
    			}
    		});

    		assert.equal(config.get('mysql.host', '192.168.1.4'));
    	});
    });
});
