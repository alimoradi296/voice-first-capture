import { requestUrl } from 'obsidian';
import { buildMultipartBody } from './multipart';

export interface TranscriptionRequest {
	apiBaseUrl: string;
	apiKey: string;
	model: string;
	language: string;
	fileName: string;
	audio: ArrayBuffer;
}

interface TranscriptionResponse {
	text?: unknown;
	error?: { message?: unknown };
}

const MIME_TYPES: Record<string, string> = {
	m4a: 'audio/mp4',
	mp3: 'audio/mpeg',
	mp4: 'audio/mp4',
	mpeg: 'audio/mpeg',
	mpga: 'audio/mpeg',
	ogg: 'audio/ogg',
	wav: 'audio/wav',
	webm: 'audio/webm',
};

export async function transcribeAudio(request: TranscriptionRequest): Promise<string> {
	const baseUrl = normalizeBaseUrl(request.apiBaseUrl);
	const boundary = `voice-first-${crypto.randomUUID()}`;
	const fields: Record<string, string> = { model: request.model };
	if (request.language) fields.language = request.language;

	const body = buildMultipartBody(
		boundary,
		fields,
		request.fileName,
		mimeTypeFor(request.fileName),
		new Uint8Array(request.audio),
	);
	const response = await requestUrl({
		url: `${baseUrl}/audio/transcriptions`,
		method: 'POST',
		contentType: `multipart/form-data; boundary=${boundary}`,
		headers: { Authorization: `Bearer ${request.apiKey}` },
		body: body.buffer as ArrayBuffer,
		throw: false,
	});

	const payload = parseResponse(response.text);
	if (response.status < 200 || response.status >= 300) {
		const serviceMessage = payload.error?.message;
		throw new Error(
			typeof serviceMessage === 'string'
				? `Transcription service returned ${response.status}: ${serviceMessage}`
				: `Transcription service returned HTTP ${response.status}.`,
		);
	}

	if (typeof payload.text !== 'string' || !payload.text.trim()) {
		throw new Error('The transcription service returned empty text.');
	}

	return payload.text.trim();
}

function normalizeBaseUrl(value: string): string {
	const trimmed = value.trim().replace(/\/+$/, '');
	if (!/^https:\/\//i.test(trimmed)) {
		throw new Error('The API base URL must start with https://.');
	}
	return trimmed;
}

function mimeTypeFor(fileName: string): string {
	const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
	return MIME_TYPES[extension] ?? 'application/octet-stream';
}

function parseResponse(text: string): TranscriptionResponse {
	try {
		return JSON.parse(text) as TranscriptionResponse;
	} catch {
		return {};
	}
}
