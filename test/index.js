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
            load: () => {
				return {
					revision: 1,
					config: configData
				}
			}
        });

        configLoaderFactory._setAsyncLoader({
            load: () => Promise.resolve({
				revision: 1,
				config: configData
			})
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

    it('should support get property by path', () => {
        config.loadSync();
        assert.equal(config.get('mongodb.port'), 27017);
    });

	it('should emit change event if data changed', done => {
		configLoaderFactory._setAsyncLoader({
            load: () => Promise.resolve({
				revision: 2,
				config: {hello: 'world'}
			})
        });

		config.emitter.on('change', () => {
			done();
		});

		config._refreshConfigIfNeed();
	});

    describe('#mock', () => {
    	it('should support mock local data as config', () => {
    		config.mock({
    			mysql: {
    				host: '192.168.1.4',
    				port: 3306
    			}
    		});

    		assert.equal(config.get('mysql.host'), '192.168.1.4');
    	});
    });

	describe('#reset', () => {
		it('should reset data and status', () => {
			config.mock({
				hello: 'world'
			});

			config.reset();

			assert.deepStrictEqual(config._status(), {
				data: null,
				loaded: false
			});
		});
	});
});
