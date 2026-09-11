import { App, PluginSettingTab, SecretComponent, Setting } from 'obsidian';
import type VoiceFirstCapturePlugin from './main';

export interface VoiceFirstCaptureSettings {
	autoTranscribe: boolean;
	apiBaseUrl: string;
	apiKeySecretId: string;
	model: string;
	language: string;
	transcriptHeading: string;
	maxAudioSizeMb: number;
}

export const DEFAULT_SETTINGS: VoiceFirstCaptureSettings = {
	autoTranscribe: false,
	apiBaseUrl: 'https://api.openai.com/v1',
	apiKeySecretId: '',
	model: 'whisper-1',
	language: '',
	transcriptHeading: 'Voices',
	maxAudioSizeMb: 25,
};

export class VoiceFirstCaptureSettingTab extends PluginSettingTab {
	plugin: VoiceFirstCapturePlugin;

	constructor(app: App, plugin: VoiceFirstCapturePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('p', {
			text: 'The plugin sends each audio recording to the transcription service that you select.',
		});

		new Setting(containerEl)
			.setName('Automatic transcription')
			.setDesc('Send a new audio recording after Obsidian saves it. This option uses a network service.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.autoTranscribe).onChange(async (value) => {
					this.plugin.settings.autoTranscribe = value;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('API key')
			.setDesc('Select or create an API key in Obsidian Secret Storage.')
			.addComponent((element) =>
				new SecretComponent(this.app, element)
					.setValue(this.plugin.settings.apiKeySecretId)
					.onChange(async (value) => {
						this.plugin.settings.apiKeySecretId = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('API base URL')
			.setDesc('Use an OpenAI-compatible API base URL. The plugin adds /audio/transcriptions.')
			.addText((text) =>
				text
					.setPlaceholder('https://api.openai.com/v1')
					.setValue(this.plugin.settings.apiBaseUrl)
					.onChange(async (value) => {
						this.plugin.settings.apiBaseUrl = value.trim();
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Model')
			.setDesc('Enter the transcription model name that your service supports.')
			.addText((text) =>
				text.setPlaceholder('whisper-1').setValue(this.plugin.settings.model).onChange(async (value) => {
					this.plugin.settings.model = value.trim();
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('Language')
			.setDesc('Optional ISO-639-1 code, such as en or fa. Leave this value empty for automatic detection.')
			.addText((text) =>
				text.setPlaceholder('Automatic').setValue(this.plugin.settings.language).onChange(async (value) => {
					this.plugin.settings.language = value.trim().toLowerCase();
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('Transcript heading')
			.setDesc('The plugin creates this level-two heading when the note does not contain it.')
			.addText((text) =>
				text.setValue(this.plugin.settings.transcriptHeading).onChange(async (value) => {
					this.plugin.settings.transcriptHeading = value.replace(/[\r\n#]/g, '').trim() || 'Voices';
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('Maximum audio size')
			.setDesc('Audio files larger than this value are not sent. The unit is MB.')
			.addText((text) =>
				text.setValue(String(this.plugin.settings.maxAudioSizeMb)).onChange(async (value) => {
					const parsed = Number(value);
					if (!Number.isFinite(parsed) || parsed < 1 || parsed > 500) return;
					this.plugin.settings.maxAudioSizeMb = parsed;
					await this.plugin.saveSettings();
				}),
			);
	}
}
