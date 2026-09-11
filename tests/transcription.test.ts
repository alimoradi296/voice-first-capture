import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMultipartBody } from '../src/multipart';

test('builds an OpenAI-compatible multipart request body', () => {
	const audio = new Uint8Array([0, 1, 2, 255]);
	const result = buildMultipartBody(
		'test-boundary',
		{ model: 'whisper-1', language: 'fa' },
		'voice.m4a',
		'audio/mp4',
		audio,
	);
	const text = new TextDecoder('latin1').decode(result);

	assert.match(text, /name="model"\r\n\r\nwhisper-1/);
	assert.match(text, /name="language"\r\n\r\nfa/);
	assert.match(text, /name="file"; filename="voice\.m4a"/);
	assert.match(text, /Content-Type: audio\/mp4/);
	assert.match(text, /--test-boundary--\r\n$/);
	assert.notEqual(findBytes(result, audio), -1);
});

test('removes unsafe characters from multipart filenames', () => {
	const result = buildMultipartBody(
		'test-boundary',
		{ model: 'whisper-1' },
		'bad"\r\nname.m4a',
		'audio/mp4',
		new Uint8Array([1]),
	);
	const text = new TextDecoder('latin1').decode(result);
	assert.match(text, /filename="bad___name\.m4a"/);
});

function findBytes(haystack: Uint8Array, needle: Uint8Array): number {
	for (let start = 0; start <= haystack.length - needle.length; start += 1) {
		if (needle.every((value, offset) => haystack[start + offset] === value)) return start;
	}
	return -1;
}
