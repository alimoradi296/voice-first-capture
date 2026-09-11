export const AUDIO_EXTENSIONS = new Set([
	'm4a',
	'mp3',
	'mp4',
	'mpeg',
	'mpga',
	'ogg',
	'wav',
	'webm',
]);

export interface AudioLink {
	path: string;
	name: string;
}

export function audioLinks(content: string): AudioLink[] {
	const result: AudioLink[] = [];
	const pattern = /!\[\[([^\]|]+\.(?:m4a|mp3|mp4|mpeg|mpga|ogg|wav|webm))(?:\|[^\]]+)?\]\]/gi;
	let match: RegExpExecArray | null;

	while ((match = pattern.exec(content)) !== null) {
		const linkPath = match[1];
		if (!linkPath) continue;
		result.push({ path: linkPath, name: linkPath.split('/').pop() ?? linkPath });
	}

	return result;
}

export function transcriptMarker(audioName: string): string {
	return `<!-- voice-first-capture:${encodeURIComponent(audioName)} -->`;
}

export function hasAudioEmbed(content: string, audioName: string): boolean {
	const escaped = escapeRegularExpression(audioName);
	return new RegExp(`!\\[\\[(?:[^\\]|]*/)?${escaped}(?:\\|[^\\]]+)?\\]\\]`, 'i').test(content);
}

export function recordingTimestamp(audioName: string, fallback: string): string {
	const match = audioName.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
	if (!match) return fallback;
	return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}`;
}

export function insertTranscript(
	content: string,
	audioName: string,
	transcript: string,
	heading: string,
	timestamp: string,
): string {
	const marker = transcriptMarker(audioName);
	if (content.includes(marker)) return content;

	const lines = content.split('\n');
	const embedIndex = lines.findIndex((line) => hasAudioEmbed(line, audioName));
	if (embedIndex === -1) return content;

	const safeHeading = heading.replace(/[\r\n#]/g, '').trim() || 'Voices';
	const headingPattern = new RegExp(`^## ${escapeRegularExpression(safeHeading)}\\s*$`, 'm');
	const headingBlock = headingPattern.test(content) ? '' : `\n## ${safeHeading}\n`;
	const quote = transcript
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map((line) => (line ? `> ${line}` : '>'))
		.join('\n');
	const block = `${headingBlock}\n${marker}\n> [!quote] Raw transcript — ${timestamp}\n${quote}\n`;
	lines.splice(embedIndex + 1, 0, block);
	return lines.join('\n');
}

function escapeRegularExpression(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
