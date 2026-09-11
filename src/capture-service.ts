import { Notice, TAbstractFile, TFile, moment } from 'obsidian';
import type VoiceFirstCapturePlugin from './main';
import {
	AUDIO_EXTENSIONS,
	audioLinks,
	hasAudioEmbed,
	insertTranscript,
	recordingTimestamp,
	transcriptMarker,
} from './markdown';
import { transcribeAudio } from './transcription';

export class CaptureService {
	private queue: Promise<void> = Promise.resolve();
	private readonly inFlight = new Set<string>();

	constructor(private readonly plugin: VoiceFirstCapturePlugin) {}

	static isAudioFile(file: TAbstractFile): file is TFile {
		return file instanceof TFile && AUDIO_EXTENSIONS.has(file.extension.toLowerCase());
	}

	enqueue(audioFile: TFile, preferredNote: TFile | null): void {
		if (this.inFlight.has(audioFile.path)) return;
		this.inFlight.add(audioFile.path);

		this.queue = this.queue
			.then(async () => this.transcribeAndInsert(audioFile, preferredNote))
			.catch((error: unknown) => {
				console.error('Voice First Capture failed', error);
				new Notice(`Voice transcription failed: ${this.errorMessage(error)}`, 10000);
			})
			.finally(() => this.inFlight.delete(audioFile.path));
	}

	async transcribeLatestInActiveNote(): Promise<void> {
		const note = this.plugin.app.workspace.getActiveFile();
		if (!(note instanceof TFile) || note.extension !== 'md') {
			new Notice('Open a Markdown note that contains an audio recording.');
			return;
		}

		const content = await this.plugin.app.vault.read(note);
		const pending = audioLinks(content).filter(
			(link) => !content.includes(transcriptMarker(link.name)),
		);
		if (pending.length === 0) {
			new Notice(
				audioLinks(content).length === 0
					? 'This note does not contain an audio recording.'
					: 'All recordings in this note have transcripts.',
			);
			return;
		}

		const latest = pending[pending.length - 1];
		if (!latest) return;
		const audioFile = this.plugin.app.metadataCache.getFirstLinkpathDest(latest.path, note.path);
		if (!(audioFile instanceof TFile) || !CaptureService.isAudioFile(audioFile)) {
			new Notice(`Audio file not found: ${latest.path}`);
			return;
		}

		this.enqueue(audioFile, note);
	}

	private async transcribeAndInsert(audioFile: TFile, preferredNote: TFile | null): Promise<void> {
		await this.waitUntilStable(audioFile.path);
		const targetNote = await this.findTargetNote(audioFile, preferredNote);
		if (!targetNote) {
			throw new Error(`No note contains ![[${audioFile.name}]].`);
		}

		const current = await this.plugin.app.vault.read(targetNote);
		if (current.includes(transcriptMarker(audioFile.name))) return;

		const secretId = this.plugin.settings.apiKeySecretId;
		const apiKey = secretId ? this.plugin.app.secretStorage.getSecret(secretId) : null;
		if (!apiKey) throw new Error('Select an API key in the plugin settings.');
		if (!this.plugin.settings.model) throw new Error('Enter a model in the plugin settings.');

		const maximumBytes = this.plugin.settings.maxAudioSizeMb * 1024 * 1024;
		if (audioFile.stat.size > maximumBytes) {
			throw new Error(
				`${audioFile.name} is larger than ${this.plugin.settings.maxAudioSizeMb} MB.`,
			);
		}

		new Notice(`Transcribing ${audioFile.name}…`);
		const audio = await this.plugin.app.vault.readBinary(audioFile);
		const transcript = await transcribeAudio({
			apiBaseUrl: this.plugin.settings.apiBaseUrl,
			apiKey,
			model: this.plugin.settings.model,
			language: this.plugin.settings.language,
			fileName: audioFile.name,
			audio,
		});
		const timestamp = recordingTimestamp(audioFile.name, moment().format('YYYY-MM-DD HH:mm'));

		await this.plugin.app.vault.process(targetNote, (content) =>
			insertTranscript(
				content,
				audioFile.name,
				transcript,
				this.plugin.settings.transcriptHeading,
				timestamp,
			),
		);
		new Notice(`Transcript added to ${targetNote.basename}.`);
	}

	private async waitUntilStable(audioPath: string): Promise<void> {
		let previousSize = -1;
		let stableChecks = 0;

		for (let attempt = 0; attempt < 40; attempt += 1) {
			const stats = await this.plugin.app.vault.adapter.stat(audioPath);
			const size = stats?.size ?? 0;
			if (size > 0 && size === previousSize) {
				stableChecks += 1;
				if (stableChecks >= 2) return;
			} else {
				stableChecks = 0;
			}
			previousSize = size;
			await this.delay(750);
		}

		throw new Error('The audio file did not finish saving within 30 seconds.');
	}

	private async findTargetNote(audioFile: TFile, preferredNote: TFile | null): Promise<TFile | null> {
		for (let attempt = 0; attempt < 10; attempt += 1) {
			const active = this.plugin.app.workspace.getActiveFile();
			for (const candidate of [preferredNote, active]) {
				if (!(candidate instanceof TFile) || candidate.extension !== 'md') continue;
				const content = await this.plugin.app.vault.read(candidate);
				if (hasAudioEmbed(content, audioFile.name)) return candidate;
			}
			await this.delay(300);
		}

		for (const note of this.plugin.app.vault.getMarkdownFiles()) {
			const content = await this.plugin.app.vault.cachedRead(note);
			if (hasAudioEmbed(content, audioFile.name)) return note;
		}
		return null;
	}

	private delay(milliseconds: number): Promise<void> {
		return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
	}

	private errorMessage(error: unknown): string {
		const message = error instanceof Error ? error.message : String(error);
		return message.split('\n')[0]?.slice(0, 180) ?? 'Unknown error.';
	}
}
