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

## Gemini conversation

Create an API key at https://aistudio.google.com/apikey. In macOS Terminal (zsh), stop the app, then:

```sh
read -s "GEMINI_API_KEY?Paste your Gemini API key: "
export GEMINI_API_KEY
npm start
```

Ordinary messages go to Gemini; explicit browser/search/timer commands remain local. Messages and up to ten successful conversation exchanges are sent to Google for context. History stays in memory and resets when the app exits. Keys remain in the main process and are never exposed to the page. The default model is `gemini-2.5-flash`; set `GEMINI_MODEL` to another supported model ID if required by your account. API availability, quotas, and billing depend on your account. Errors are displayed in the conversation. Fish Audio is independently required for speech; a voice error does not remove Gemini's written answer. Never paste keys into the chat input or commit them.

Gemini request formatting, history, and error handling are tested using mocked responses. A live API response requires your configured key and has not been verified in the cloud workspace.

## Local conversation with Ollama (default)

1. Install Ollama for macOS from https://ollama.com/download/mac and open it. Follow its command-line installation prompt. Keep the app running.
2. In a new Terminal window, run `ollama pull qwen3:4b`. This downloads several GB. Start with `qwen3:1.7b` instead on a memory-constrained Mac and set `export OLLAMA_MODEL=qwen3:1.7b` in the Terminal used to launch JARVIS.
3. Verify the model with `ollama run qwen3:4b "Say hello in one sentence."` (substitute your selected model).
4. From the project directory, run `npm start`. No Gemini key is needed. The first reply can take time while loading the model; requests time out after three minutes.

The Ollama app must run on the same Mac as JARVIS, listening on its default local port 11434. No exposed network port is required. JARVIS uses only the local `/api/chat` endpoint, retaining six exchanges in memory. Model response speed and quality depend on available memory and hardware. Local chat sends no prompts to Gemini. Fish Audio still sends response text to its cloud service for speech and requires its own valid key. To return to Gemini, set `export JARVIS_AI_PROVIDER=gemini` and supply `GEMINI_API_KEY` before launching.

Ollama integration is covered by mocked HTTP tests; live model execution must be verified on your Mac.
