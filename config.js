var nitrogen = require('nitrogen')
  , Store = require('nitrogen-leveldb-store');

// By default, run against the hosted Nitrogen service in the cloud.  Uncomment the lines below
// to run against a locally running service.

var config = {
//    host: 'localhost',
//    http_port: 3030,
//    protocol: 'http'
};

config.store = new Store(config);

config.log_levels = ['info', 'warn', 'error', 'debug'];

module.exports = config;
