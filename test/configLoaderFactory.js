var assert = require('assert');
var mockery = require('mockery');

var loaderFactory = require('../configLoaderFactory');

var fakeConfigData = {
    hello: 'world',
    mongodb: {
        host: 'localhost',
        port: 27017
    }
};

var fetchMock = function() {
    return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(fakeConfigData)),
        json: () => Promise.resolve(fakeConfigData)
    })
}

var errorFetchMock = function() {
    return Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve(JSON.stringify({
            errorId: 'internal-server-error'
        })),
        json: () => Promise.resolve({
            errorId: 'internal-server-error'
        })
    })
}

var syncRequestMock = function() {
    return {
        statusCode: 200,
        getBody: () => new Buffer(JSON.stringify(fakeConfigData))
    };
}

var errorSyncRequestMock = function() {
    return {
        statusCode: 500,
        getBody: () => {
            return new Buffer(JSON.stringify({
                errorId: 'internal-server-error'
            }));
        }
    };
}

describe('configLoaderFactory', () => {
    describe('sync-loader', () => {

        describe('error-handling', () => {
            beforeEach(() => {
                mockery.registerMock('sync-request', errorSyncRequestMock);
                mockery.registerAllowable('../configLoaderFactory');
                mockery.enable({ useCleanCache: true });
                mockery.resetCache();
            });

            it('should return error if http request failed', () => {
                var loaderFactory = require('../configLoaderFactory');

                assert.throws(() => {
                    var loader = loaderFactory.getSyncLoader();
                    loader.load();
                }, /api error/);
            });

            afterEach(() => {
                mockery.deregisterAll();
                mockery.resetCache();
                mockery.disable();
            });
        })

        beforeEach(() => {
            mockery.registerMock('sync-request', syncRequestMock);
            mockery.registerAllowable('../configLoaderFactory');
            mockery.enable({ useCleanCache: true });
            mockery.resetCache();
        });

        it('should get data if api calls succeed', () => {
            var loaderFactory = require('../configLoaderFactory');
            var loader = loaderFactory.getSyncLoader();
            var data = loader.load();
            assert.deepStrictEqual(data, fakeConfigData);
        });

        afterEach(() => {
            mockery.deregisterAll();
            mockery.resetCache();
            mockery.disable();
        });
    });

    describe('async-loader', () => {

        describe('error-handling', () => {
            beforeEach(() => {
                mockery.registerMock('node-fetch', errorFetchMock);
                mockery.registerAllowable('../configLoaderFactory');
                mockery.enable({ useCleanCache: true });
                mockery.resetCache();
            });

            it('should return error if http request failed', (done) => {
                var loaderFactory = require('../configLoaderFactory');
                var loader = loaderFactory.getAsyncLoader();
                loader.load().then(() => {
                    done(new Error('api error not throwed'));
                }).catch(e => {
                    try {
                        assert.ok(/api error/.test(e));
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });
            afterEach(() => {
                mockery.deregisterAll();
                mockery.resetCache();
                mockery.disable();
            });
        });

        beforeEach(() => {
            mockery.registerMock('node-fetch', fetchMock);
            mockery.registerAllowable('../configLoaderFactory');
            mockery.enable({ useCleanCache: true });
            mockery.resetCache();
        });

        it('should get data if api calls succeed', done => {
            var loaderFactory = require('../configLoaderFactory');
            var loader = loaderFactory.getAsyncLoader();
            loader.load().then(data => {
                try {
                    assert.deepStrictEqual(data, fakeConfigData);
                    done();
                } catch (e) {
                    done(e);
                }
            }).catch(done);
        });

        afterEach(() => {
            mockery.deregisterAll();
            mockery.resetCache();
            mockery.disable();
        });
    });

    describe('get/set loader', () => {
        afterEach(() => {
            loaderFactory._reset();
        });

        it('it should support set sync loader manually', () => {
            var loader = {
                load: () => {
                    return { hello: 'world' }
                }
            };
            loaderFactory._setSyncLoader(loader);
            assert.equal(loaderFactory.getSyncLoader(), loader);
        });

        it('it should support set async loader manually', () => {
            var loader = {
                load: () => {
                    return Promise.resolve({ hello: 'world' });
                }
            };
            loaderFactory._setAsyncLoader(loader);
            assert.equal(loaderFactory.getAsyncLoader(), loader);
        });
    });
});
