# JARVIS for macOS

An initial Electron desktop prototype with an amber holographic interface inspired by Age of Ultron. Audio playback drives the core animation through a Web Audio analyser.

## Run on your Mac

Install Node.js 22 or newer, then in this project folder:

```sh
npm ci
read -s FISH_AUDIO_API_KEY
export FISH_AUDIO_API_KEY
npm start
```

Paste your Fish Audio API key into the hidden terminal prompt and press Return. Never commit the key. The main process uses it for `https://api.fish.audio/v1/tts` with voice `14129c3e320149449d6bada6862f7338`. This integration needs a funded account with access to that voice; live speech has not yet been verified.

Try:

- `open youtube.com`
- `search for latest space news`
- `set a timer for 5 minutes`

Closing the window keeps JARVIS running in the menu bar. Choose Quit in that menu to exit. Timers are stored in the application data directory and checked after waking from sleep or relaunch. The Mac must be awake for on-time alarms; quitting the app prevents delivery until relaunch. Allow notifications in macOS settings.

Microphone input uses the runtime's speech recognition if available. Electron may not provide a working recognition service, so typed commands are the supported initial workflow. This version does not yet implement general AI conversation, wake word detection, browser page automation, or clock-time/recurring alarms.

## Checks and packaging

```sh
npm run check
npm test
npm run dist:mac
```

Build the DMG on your Mac. Signing and notarization require your Apple Developer credentials and are not configured. An unsigned local development build may require explicit permission in macOS. No macOS build or native permissions have been validated in the Linux cloud workspace.
