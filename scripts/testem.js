/* eslint-disable camelcase */
/* eslint-disable no-warning-comments */
/* eslint-disable no-console */

'use strict';

const path = require('path');
const http = require('http');
const fs = require('fs');
const shell = require('shelljs');
const port = 7358;
let server;

module.exports = {
  framework: 'qunit',
  test_page: 'test/index.html',
  serve_files: [
    'node_modules/sinon/pkg/sinon.js',
    'node_modules/video.js/dist/video.js',
    'test/dist/bundle.js'
  ],
  src_files: [
    'src/plugin.js'
  ],
  launch_in_ci: ['Chrome', 'Safari', 'Firefox'],
  launch_in_dev: ['Chrome', 'Safari', 'Firefox'],
  browser_start_timeout: 120,
  browser_args: {
    /*
    Not running Chrome headless. Fails with `Error: Browser exited unexpectedly`, and sometimes this error:
    [1222/143442.836922:WARNING:sqlite_persistent_store_backend_base.cc(198)] Failed to post task from operator()@net/extras/sqlite/sqlite_persistent_shared_dictionary_store.cc:252 to client_task_runner_.
    */
    // Chrome: {
    //   ci: [
    //     '--headless',
    //     '--disable-dev-shm-usage',
    //     '--enable-automation',
    //     '--no-sandbox',
    //     '--user-data-dir=/tmp'
    //   ]
    // },
    Firefox: {
      ci: ['--headless']
    }
  },
  launchers: {
    // Allow safari to proceed without user intervention. See https://github.com/testem/testem/issues/1387
    // TODO: Leaves the page open
    Safari: {
      protocol: 'browser',
      exe: 'osascript',
      args: [
        '-e',
        `tell application "Safari"
          activate
          open location "<url>"
         end tell
         delay 3000`
      ]
    }
  },
  // instrument files, spin up http server to write coverage data to disk
  before_tests(config, data, callback) {
    shell.exec('node ./node_modules/istanbul/lib/cli.js instrument --output instrumented src', function(code, output) {
      if (code) {
        callback(code, output);
        return;
      }

      // if instrumented successfully
      // start the server
      server = http.createServer(function(req, res) {
        console.error('... Received coverage of', req.headers['content-length'], 'length');
        // need separate files per browser/client
        req.pipe(fs.createWriteStream(path.join(__dirname, 'coverage-' + Math.random() + '.json')));
        // make sure we've got it all
        req.on('end', res.end.bind(res));
      }).listen(port, function(serverErr) {
        console.error('------ Listening for coverage on ' + port);
        // when server is ready
        // pass control back to testem
        callback(serverErr);
      });
    });
  },
  // after tests done, stop http server, combined coverage data into the report
  after_tests(config, data, callback) {
    // shutdown teh server
    server.close();

    // generate report
    shell.exec('node ./node_modules/istanbul/lib/cli.js report', function(code, output) {
      if (code) {
        return callback(code, output);
      }

      // check on generated report
      const lcov = shell.grep('end_of_record', path.join(__dirname, 'coverage/lcov.info'));
      const report = shell.grep('src/index.html', path.join(__dirname, 'coverage/lcov-report/index.html'));

      if (!lcov || !report) {
        callback(new Error('Unable to generate report'));
        return;
      }

      // everything is good
      callback(null);
    });
  }
};
