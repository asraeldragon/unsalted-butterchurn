# unsalted-butterchurn

A very simple webpage that provides a music visualizer for fun trippy effects. Uses the [butterchurn](https://butterchurnviz.com/) port of Milkdrop.

Made to be compatible with [Open Broadcaster Software](https://obsproject.com/)!

A pre-compiled version of this is available at https://asraeldragon.github.io/unsalted-butterchurn, but you can also run it on your machine if you don't want to rely on GitHub Pages.

Recommended to use with software like [VoiceMeeter Banana](https://vb-audio.com/Voicemeeter/banana.htm) or [Virtual Audio Cable](https://vb-audio.com/Cable/), so you can pipe your desktop music into the visualizer while being able to separate out things like Discord calls and your actual microphone.

<!-- TOC -->
Table of Contents
- [unsalted-butterchurn](#unsalted-butterchurn)
- [Usage](#usage)
  - [Query Parameters Reference](#query-parameters-reference)
- [OBS Instructions](#obs-instructions)
  - [Launching OBS with browser microphone capabilities](#launching-obs-with-browser-microphone-capabilities)
  - [Adding the Visualizer](#adding-the-visualizer)
- [Development](#development)
<!-- /TOC -->

# Usage
In a normal browser, click into the webpage to get a prompt for which microphone you want to visualize. The visualizer will run at 60 FPS and rotate visualization presets every 25 seconds.

To configure the visualizer's behavior, you must set query parameters in the URL.

To make this easier you can use a tool like [345tool's Query String Generator](https://345tool.com/generator/query-string-generator).

If you want to do this manually, add `?` to the end of the URL. Each query parameter is a pair joined by an `=`, like `key=value`. If you have multiple query parameters, put a `&` between each one. You shouldn't need to do this, but if you have any issues, try replacing any spaces in your values with `%20`.

## Query Parameters Reference
Use the following table for the available parameters:
| Key | Default Value | Description |
| - | - | - |
| `presetRotateTime` | `25.0` | The amount of time between preset changes, in seconds. |
| `presetBlendTime` | `3.0` | The amount of time the visualizer will shift from one preset to another, in seconds. |
| `fps` | `60` | Number of frames per second to render at. Will probably be capped at your refresh rate because it relies on browser render timing. |
| `width` | `1920` | Initial width of the rendering field, in pixels. Will change automatically if you resize the window. |
| `height` | `1080` | Initial height of the rendering field, in pixels. Will change automatically if you resize the window. |
| `volumeMultiplier` | `1.25` | A multiplier on the volume of your music, useful for getting more interesting reactions out of the visualizer even if you listen to quieter music. |
| `audioDeviceName` | (blank string) | If this isn't blank, then the visualizer will attempt to grab the listed audio device without prompting for permission. Useful for OBS (and only really works with OBS because modern non-embedded browsers require a permission prompt and don't label devices) |
| `debugShowAudioDeviceNames` | `false` | If true, the visualizer will show a list of device names, as given to it by the browser. Useful for `audioDeviceName` in OBS (and only really works with OBS because modern non-embedded browsers don't give device labels) |
| `pixelRatio` | `window.devicePixelRatio ?? 1` | A multiplier on pixel density, automatically detected for HiDPI devices, or 1 otherwise. |
| `textureRatio` | `1` | A multiplier on how large the rendering texture is (check [butterchurn](https://github.com/jberg/butterchurn), I actually don't know what this does exactly) |
| `meshHeight` | `48` | (check [butterchurn](https://github.com/jberg/butterchurn), I actually don't know what this does exactly) |
| `meshWidth` | `36` | (check [butterchurn](https://github.com/jberg/butterchurn), I actually don't know what this does exactly) |

# OBS Instructions

## Launching OBS with browser microphone capabilities
Since OBS version 27, you will need to launch OBS with the `--use-fake-ui-for-media-stream` flag.

If you're using an older version for some reason and this flag doesn't work for you, try `--enable-media-stream`.

To add that flag on Windows, create a shortcut pointing to the OBS executable (or use the one that the installer already created for you). Right-click it and go to Properties.

In the `Target` field, add a space after the double-quotes at the end, then add the flag. Click OK.

## Adding the Visualizer
Create a Browser source. As in the [Usage](#usage) section, customize its behavior with query parameters.

You may want to check the "Use custom frame rate" box and match it with your chosen FPS, if you've configured the visualizer to run at anything that isn't your output FPS.

Because OBS' browser source is an embedded custom browser, it won't prompt you for permission or to select an audio source. It will by default, use your default microphone as the audio source (whatever that is according to your OS, not what you have selected in OBS).

To customize this, use the `audioDeviceName` query parameter to make the visualizer grab one particular device by name. In Windows, it should be whatever your audio device is called in the Sound Settings.

If you need help figuring out what the audio device is called, set `debugShowAudioDeviceNames=true` in your query parameter, which will print out a bunch of names over top of the visualizer. Then, you can right-click the source and click Interact (or click the little Interact button on the toolbar with the Browser source selected) to highlight and copy-paste the name you want into the `audioDeviceName` value.

# Development
This is a simple project that uses only a few files.

To run a local server, run `yarn start`. It will start up a server with live reloading on `localhost:3000`. You will need to restart this process if you change `src/index.html.template` unfortunately, as the file watchers don't notice that file having changed.

When committing or making a pull request, please run `yarn lint` first and apply any fixes it suggests.

Be sure not to commit anything in `docs/` or `dist/`, at least not to the main branch.
