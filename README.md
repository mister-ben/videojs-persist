# videojs-persist

Stores volume, muted and playback rate to local storage to be restored in the next session.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Usage](#usage)
  - [`<script>` Tag](#script-tag)
  - [Browserify/CommonJS](#browserifycommonjs)
  - [RequireJS/AMD](#requirejsamd)
- [Options](#options)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## Installation

```sh
npm install --save videojs-persist
```

## Usage

To include videojs-persist on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-persist.min.js"></script>
<script>
  var player = videojs('my-video');

  player.persist();
</script>
```

Alternatively get the files from a CDN e.g. https://unpkg.com/videojs-persist/dist/videojs-persist.min.js

### Browserify/CommonJS

When using with Browserify, install videojs-persist via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-persist');

var player = videojs('my-video');

player.persist();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-persist'], function(videojs) {
  var player = videojs('my-video');

  player.persist();
});
```

## Options

* `muted` persist muted. default `true`
* `volume` persist muted. default `true`
* `playbackRate` persist muted. default `true`
* `restoreUnsupportedRate` restore playback when not in current rates option. default `false`
* `key` localstorage key to use.  default `videojs-persist`

By default, playbackRate will not be restored on a player that does not have that rate in its options. This is to avoid having a player playing an unexpected rate, without the control to change it. Setting `restoreUnsupportedRate` to `true` will set it regardless.

## License

MIT. Copyright (c) mister-ben &lt;git@misterben.me&gt;


[videojs]: http://videojs.com/
