import type { FastifyInstance } from 'fastify';
import { WebSocket as WsSocket } from 'ws';
import { env } from '../../config/env';
import { verifyAccessToken } from '../../utils/jwt';

export async function transcribeRoutes(app: FastifyInstance) {
	app.get('/stream', { websocket: true }, (socket, req) => {
		if (!env.DEEPGRAM_API_KEY) {
			socket.send(JSON.stringify({ type: 'error', message: 'Deepgram not configured on server' }));
			socket.close();
			return;
		}

		// Verify JWT from query param (WebSocket can't send headers easily)
		const token = (req.query as Record<string, string>).token;
		if (!token) {
			socket.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
			socket.close();
			return;
		}
		try {
			verifyAccessToken(token);
		} catch {
			socket.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
			socket.close();
			return;
		}

		// Open Deepgram WebSocket — Deepgram auto-detects format from container (webm/opus from MediaRecorder)
		const dgUrl =
			'wss://api.deepgram.com/v1/listen' +
			'?model=nova-3' +
			'&language=en-US' +
			'&smart_format=true' +
			'&interim_results=true' +
			'&endpointing=500';

		console.log('[transcribe] Connecting to Deepgram...');

		const dg = new WsSocket(dgUrl, {
			headers: { Authorization: `Token ${env.DEEPGRAM_API_KEY}` }
		});

		// Buffer chunks that arrive before Deepgram is ready
		const pendingChunks: Buffer[] = [];
		let dgReady = false;

		dg.on('open', () => {
			console.log('[transcribe] Deepgram connected — flushing', pendingChunks.length, 'buffered chunks');
			dgReady = true;
			// Flush buffered chunks (includes the critical WebM header)
			for (const chunk of pendingChunks) {
				dg.send(chunk);
			}
			pendingChunks.length = 0;
			socket.send(JSON.stringify({ type: 'ready' }));
		});

		dg.on('message', (raw) => {
			try {
				const msg = JSON.parse(raw.toString());
				const transcript = msg?.channel?.alternatives?.[0]?.transcript ?? '';
				const isFinal = msg.is_final === true;
				if (transcript) {
					console.log('[transcribe]', isFinal ? 'FINAL:' : 'interim:', transcript);
					socket.send(JSON.stringify({ type: 'transcript', transcript, isFinal }));
				}
			} catch {
				// ignore parse errors
			}
		});

		dg.on('error', (err) => {
			console.error('[transcribe] Deepgram error:', err.message);
			socket.send(JSON.stringify({ type: 'error', message: err.message }));
		});

		dg.on('close', (code, reason) => {
			console.log('[transcribe] Deepgram closed:', code, reason?.toString());
			socket.close();
		});

		// Forward audio chunks from desktop → Deepgram
		socket.on('message', (chunk) => {
			const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as ArrayBuffer);
			if (dgReady && dg.readyState === WsSocket.OPEN) {
				dg.send(buf);
			} else {
				// Buffer until Deepgram is connected
				pendingChunks.push(buf);
			}
		});

		// Clean up when desktop disconnects
		socket.on('close', () => {
			if (dg.readyState === WsSocket.OPEN || dg.readyState === WsSocket.CONNECTING) {
				dg.close();
			}
		});
	});
}
