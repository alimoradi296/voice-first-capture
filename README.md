# Voice First Capture

Record a thought in Obsidian. Receive its transcript in the same note.

The plugin watches new audio recordings, sends audio to your chosen transcription provider, and inserts the returned text beside the audio embed.

**Status:** `0.1.0` beta, installed through BRAT. Requires Obsidian 1.11.4 or later and a compatible transcription API.
The manifest permits desktop and mobile. Device and provider compatibility still require verification in your environment.

[Install the beta](#install-the-beta-with-brat) · [Try one recording](#try-one-recording) · [Privacy](#privacy) · [Limits](#limits)

## The interaction

```text
Open a note → record → stop → transcript appears beside the audio
```

Illustrative note output, with synthetic words and a sample date:

```markdown
![[Recording 20260101100000.m4a]]

## Voices

<!-- voice-first-capture:Recording%2020260101100000.m4a -->
> [!quote] Raw transcript — 2026-01-01 10:00
> Write down the next step before starting the task.
```

## Features

- Transcribe new recordings automatically.
- Transcribe the latest recording with a command.
- Insert the transcript into the source note.
- Prevent duplicate transcripts.
- Support English, Persian, and automatic language detection.
- Work with OpenAI-compatible transcription services.
- Store the API key in Obsidian Secret Storage.
- Use the same plugin bundle on desktop and mobile; verify behavior on your device.

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

## Try one recording

1. Complete the installation and configuration steps above.
2. Open a Markdown note.
3. Start the Obsidian audio recorder.
4. Speak a short sentence.
5. Stop the recorder.
6. Wait for the completion notice.
7. Verify that the transcript appears beside the audio embed.

The plugin adds a `## Voices` heading and a raw-transcript callout. You can change the heading in the settings.

## Use manual transcription

1. Open a note that contains an audio embed.
2. Open the command palette.
3. Run **Voice First Capture: Transcribe latest recording in active note**.

You can also select the audio-lines icon in the ribbon.

## Supported audio files

The plugin recognizes `m4a`, `mp3`, `mp4`, `mpeg`, `mpga`, `ogg`, `wav`, and `webm` files. Your provider can support fewer formats.

## Limits

- The beta requires a network connection and a transcription API key.
- Provider fees, file-size limits, model names, and language accuracy depend on the provider.
- The plugin stores raw transcription text. It does not summarize or reorganize your note.
- Duplicate protection uses a marker for the recording filename. Keep that marker to avoid another insertion.
- If automatic transcription misses a recording, use the manual command in the source note.
- The automated tests cover Markdown insertion and transcription request construction.
- These tests do not certify a live transcription provider or every desktop and mobile device.

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
