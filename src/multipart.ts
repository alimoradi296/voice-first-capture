export function buildMultipartBody(
	boundary: string,
	fields: Record<string, string>,
	fileName: string,
	contentType: string,
	fileBytes: Uint8Array,
): Uint8Array {
	const encoder = new TextEncoder();
	const chunks: Uint8Array[] = [];

	for (const [name, value] of Object.entries(fields)) {
		chunks.push(
			encoder.encode(
				`--${boundary}\r\nContent-Disposition: form-data; name="${safeHeaderValue(name)}"\r\n\r\n${value}\r\n`,
			),
		);
	}

	chunks.push(
		encoder.encode(
			`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${safeHeaderValue(fileName)}"\r\nContent-Type: ${contentType}\r\n\r\n`,
		),
		fileBytes,
		encoder.encode(`\r\n--${boundary}--\r\n`),
	);

	const totalLength = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return result;
}

function safeHeaderValue(value: string): string {
	return value.replace(/["\r\n]/g, '_');
}
