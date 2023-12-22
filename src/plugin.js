import videojs from 'video.js';
import {version as VERSION} from '../package.json';
import window from 'global/window';

/**
 * @typedef   {object} PersistOptions
 *            Options for the persist plugin
 * @property  {boolean} [options.muted=true]
 *            Whether to store muted state
 * @property  {boolean} [options.playbackRate=true]
 *            Whether to save the playback rate
 * @property  {boolean} [options.volume=true]
 *            Whether to store the volume
 * @property  {boolean} [options.restoreUnsupportedRate=false]
 *            Whether to restore a playback rate when it is not a rate that would be displayed in the player control
 * @property  {string} [options.key='videojs-persist']
 *            A prefix to use for the local storage key
 */

// Default options for the plugin.
/** @type {PersistOptions} */
const defaults = {
  muted: true,
  playbackRate: true,
  volume: true,
  restoreUnsupportedRate: false,
  key: 'videojs-persist'
};

/**
 * Checks local storage is available
 *
 * @return {boolean} whether available
 */
const localStorageAvailable = () => {
  const key = 'videojs-persist-test-' + Math.floor(Math.random() * 10);

  try {
    window.localStorage.setItem(key, '.');
    window.localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-persist');

  const playerRates = (player.playbackRates ? player.playbackRates() : player.options_.playbackRates || []);

  const data = JSON.parse(window.localStorage.getItem(options.key)) || {};

  ['playbackRate', 'volume', 'muted'].forEach(prop => {
    if (!options[prop]) {
      return;
    }
    const val = data[prop];

    if (val) {
      if (prop === 'playbackRate' && !options.restoreUnsupportedRate && !playerRates.includes(val)) {
        return;
      }

      player[prop](val);
    }
  });

  if (options.playbackRate) {
    player.on('ratechange', () => {
      player.defaultPlaybackRate(player.playbackRate());
      data.playbackRate = player.playbackRate();
      window.localStorage.setItem(options.key, JSON.stringify(data));
    });
  }

  if (options.muted || options.volume) {
    player.on('volumechange', () => {
      if (options.muted) {
        player.defaultMuted(player.muted());
        data.muted = player.muted();
      }
      if (options.volume) {
        data.volume = player.volume();
      }
      window.localStorage.setItem(options.key, JSON.stringify(data));
    });
  }
};

/**
 * A video.js plugin to use localstorage to save player settings in localstorage
 *
 * @function persist
 * @param    {PersistOptions} [options={}]
 *           Persist plugin options

 */
const persist = function(options) {
  if (!localStorageAvailable()) {
    videojs.log('videojs-persist aborted. localStorage not available.');
    return;
  }

  this.ready(() => {
    onPlayerReady(this, (videojs.obj ? videojs.obj.merge : videojs.mergeOptions)(defaults, options));
  });
};

// Register the plugin with video.js.
videojs.registerPlugin('persist', persist);

// Include the version number.
persist.VERSION = VERSION;

export default persist;
