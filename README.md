# Voice First Capture

Voice First Capture transcribes an Obsidian audio recording into the note where you recorded it.

Record your thought and stop the recorder. The plugin sends the audio to your transcription service. It then adds the raw transcript beside the audio embed.

## Features

- Transcribe new recordings automatically.
- Transcribe the latest recording with a command.
- Insert the transcript into the source note.
- Prevent duplicate transcripts.
- Support English, Persian, and automatic language detection.
- Work with OpenAI-compatible transcription services.
- Store the API key in Obsidian Secret Storage.
- Run on desktop and mobile.

## Privacy

The plugin does not collect telemetry.

The plugin sends these data to the API base URL in your settings:

- The audio recording.
- The selected model name.
- The optional language code.

The plugin does not send your note text, vault path, or other vault files. Your transcription provider processes the audio under its own privacy policy.

Automatic transcription is disabled by default. Enable it only after you select an API key and review the API base URL.

## Requirements

- Obsidian 1.11.4 or later.
- An API key for an OpenAI-compatible transcription service.
- A transcription model that the service supports.

## Install the beta with BRAT

1. Install the BRAT plugin from **Settings → Community plugins**.
2. Open **Settings → BRAT**.
3. Select **Add beta plugin**.
4. Enter `https://github.com/alimoradi296/voice-first-capture`.
5. Enable **Voice First Capture**.

## Configure the plugin

1. Open **Settings → Voice First Capture**.
2. Select or create an API key.
3. Enter the API base URL.
4. Enter the transcription model.
5. Enter `en` or `fa` if you want a fixed language.
6. Enable **Automatic transcription**.

For OpenAI, use these values:

```text
API base URL: https://api.openai.com/v1
Model: whisper-1
```

Other providers can use different model names. The provider must implement the OpenAI-compatible `/audio/transcriptions` endpoint.

## Use automatic transcription

1. Open a Markdown note.
2. Start the Obsidian audio recorder.
3. Speak your note.
4. Stop the recorder.
5. Wait for the completion notice.

The plugin adds a `## Voices` heading and a raw-transcript callout. You can change the heading in the settings.

## Use manual transcription

1. Open a note that contains an audio embed.
2. Open the command palette.
3. Run **Voice First Capture: Transcribe latest recording in active note**.

You can also select the audio-lines icon in the ribbon.

## Supported audio files

The plugin recognizes `m4a`, `mp3`, `mp4`, `mpeg`, `mpga`, `ogg`, `wav`, and `webm` files. Your provider can support fewer formats.

## Development

```bash
npm install
npm test
npm run lint
npm run build
```

The production build creates `main.js` in the repository root.

## License

[MIT](LICENSE)
