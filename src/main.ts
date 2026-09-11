import { Notice, Plugin, TFile } from 'obsidian';
import { CaptureService } from './capture-service';
import {
	DEFAULT_SETTINGS,
	VoiceFirstCaptureSettingTab,
	type VoiceFirstCaptureSettings,
} from './settings';

export default class VoiceFirstCapturePlugin extends Plugin {
	settings!: VoiceFirstCaptureSettings;
	captureService!: CaptureService;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.captureService = new CaptureService(this);

		this.addCommand({
			id: 'transcribe-latest-recording-in-active-note',
			name: 'Transcribe latest recording in active note',
			callback: () => void this.captureService.transcribeLatestInActiveNote(),
		});

		this.addRibbonIcon('audio-lines', 'Transcribe latest recording', () => {
			void this.captureService.transcribeLatestInActiveNote();
		});

		this.addSettingTab(new VoiceFirstCaptureSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.registerEvent(
				this.app.vault.on('create', (file) => {
					if (!this.settings.autoTranscribe || !CaptureService.isAudioFile(file)) {
						return;
					}

					const activeFile = this.app.workspace.getActiveFile();
					const preferredNote = activeFile instanceof TFile ? activeFile : null;
					this.captureService.enqueue(file, preferredNote);
				}),
			);
		});
	}

	async loadSettings(): Promise<void> {
		const stored = (await this.loadData()) as Partial<VoiceFirstCaptureSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, stored ?? {});
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		new Notice('The settings are saved.');
	}
}
