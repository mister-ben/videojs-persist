import document from 'global/document';
import window from 'global/window';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';

import plugin from '../src/plugin';

const Player = videojs.getComponent('Player');

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

QUnit.module('videojs-persist', {

  beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5. This MUST come
    // before any player is created; otherwise, timers could get created
    // with the actual timer methods!
    this.clock = sinon.useFakeTimers();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);

    // let vol;
    // let muted;
    // let rate;

    // this.player.tech_.volume = v => {
    //   if (v) {
    //     if (v !== vol) {
    //       vol = v;
    //       this.player.trigger('volumechange');
    //     }
    //   } else {
    //     return vol;
    //   }
    // };
    // this.player.tech_.muted = m => {
    //   if (m) {
    //     if (m !== muted) {
    //       muted = m;
    //       this.player.trigger('volumechange');
    //     }
    //   } else {
    //     return muted;
    //   }
    // };
    // this.player.tech_.playbackRate = r => {
    //   if (r) {
    //     if (r !== rate) {
    //       rate = r;
    //       this.player.trigger('ratechange');
    //     }
    //   } else {
    //     return rate;
    //   }
    // };
  },

  afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

QUnit.test('registers itself with video.js', function(assert) {
  assert.expect(2);

  assert.strictEqual(
    typeof Player.prototype.persist,
    'function',
    'videojs-persist plugin was registered'
  );

  this.player.persist();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.ok(
    this.player.hasClass('vjs-persist'),
    'the plugin adds a class to the player'
  );
});

QUnit.test('stores volume', function(assert) {
  assert.expect(2);

  const key = 't1';

  window.localStorage.removeItem(key);

  this.player.persist({key});
  this.clock.tick(1);

  const vol = this.player.volume() / 2;

  this.player.volume(vol);
  this.player.trigger('volumechange');

  this.clock.tick(1);

  const data = JSON.parse(window.localStorage.getItem(key)) || {};

  assert.strictEqual(
    data.volume,
    vol,
    'volume is stored'
  );
  assert.strictEqual(
    data.muted,
    this.player.muted(),
    'muted is stored'
  );
});

QUnit.test('stores playbackrate', function(assert) {
  const key = 't2';

  window.localStorage.removeItem(key);

  this.player.persist({key});
  this.clock.tick(1);

  this.player.playbackRate(1.5);
  this.player.trigger('ratechange');

  this.clock.tick(1);

  const data = JSON.parse(window.localStorage.getItem(key)) || {};

  assert.strictEqual(
    data.playbackRate,
    this.player.playbackRate(),
    'playbackrate is stored'
  );
});

QUnit.test('volume restored', function(assert) {
  const key = 't3';

  window.localStorage.setItem(key, JSON.stringify({
    volume: 0.7
  }));

  this.player.persist({key});
  this.clock.tick(1);

  assert.strictEqual(
    this.player.volume(),
    0.7,
    'volume is set'
  );
});

QUnit.test('playback restored with restoreUnsupportedRate', function(assert) {
  const key = 't4';

  window.localStorage.setItem(key, JSON.stringify({
    playbackRate: 1.5
  }));

  const sandbox = sinon.createSandbox();
  const spy = sandbox.spy(this.player, 'playbackRate');

  this.player.persist({key, restoreUnsupportedRate: true});
  this.clock.tick(1);

  assert.ok(
    spy.calledWith(1.5),
    'rate is set'
  );
});

QUnit.test('playback not restored without restoreUnsupportedRate', function(assert) {
  const key = 't5';

  window.localStorage.setItem(key, JSON.stringify({
    playbackRate: 1.5
  }));

  const sandbox = sinon.createSandbox();
  const spy = sandbox.spy(this.player, 'playbackRate');

  this.player.persist({key});
  this.clock.tick(1);

  assert.ok(
    spy.notCalled,
    'rate is set'
  );
});

QUnit.test('playback restored if within rates', function(assert) {
  const key = 't6';

  window.localStorage.setItem(key, JSON.stringify({
    playbackRate: 1.5
  }));

  const sandbox = sinon.createSandbox();
  const spy = sandbox.spy(this.player, 'playbackRate');

  this.player.options_.playbackRates = [1, 1.5];
  this.player.persist({key});
  this.clock.tick(1);

  assert.ok(
    spy.calledWith(1.5),
    'rate is set'
  );
});
