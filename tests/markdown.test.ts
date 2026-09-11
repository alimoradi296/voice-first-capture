import assert from 'node:assert/strict';
import test from 'node:test';
import {
	audioLinks,
	hasAudioEmbed,
	insertTranscript,
	recordingTimestamp,
	transcriptMarker,
} from '../src/markdown';

test('finds supported embedded audio links', () => {
	const content = '![[Recording 20260911123456.m4a]]\n![[attachments/idea.webm|Voice]]';
	assert.deepEqual(audioLinks(content), [
		{ path: 'Recording 20260911123456.m4a', name: 'Recording 20260911123456.m4a' },
		{ path: 'attachments/idea.webm', name: 'idea.webm' },
	]);
	assert.equal(hasAudioEmbed(content, 'idea.webm'), true);
});

test('inserts a quoted transcript after the matching embed', () => {
	const audioName = 'Recording 20260911123456.m4a';
	const original = `# Daily note\n\n![[${audioName}]]\n\nEnd\n`;
	const result = insertTranscript(
		original,
		audioName,
		'First line\nSecond line',
		'Voices',
		'2026-09-11 12:34',
	);

	assert.match(result, /## Voices/);
	assert.match(result, /> \[!quote\] Raw transcript — 2026-09-11 12:34/);
	assert.match(result, /> First line\n> Second line/);
	assert.ok(result.indexOf(transcriptMarker(audioName)) > result.indexOf(`![[${audioName}]]`));
});

test('does not insert the same transcript twice', () => {
	const audioName = 'voice.m4a';
	const original = `![[${audioName}]]`;
	const first = insertTranscript(original, audioName, 'One', 'Voices', '2026-09-11 12:00');
	const second = insertTranscript(first, audioName, 'Two', 'Voices', '2026-09-11 12:01');
	assert.equal(second, first);
	assert.doesNotMatch(second, /> Two/);
});

test('reads a timestamp from the Obsidian recording name', () => {
	assert.equal(
		recordingTimestamp('Recording 20260911123456.m4a', 'fallback'),
		'2026-09-11 12:34',
	);
	assert.equal(recordingTimestamp('voice.m4a', 'fallback'), 'fallback');
});
