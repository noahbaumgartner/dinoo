/**
 * Production entry point (`npm start`, after `npm run build`).
 *
 * Clients reach the laptop by IP address and by its local DNS name, always over plain HTTP. With
 * adapter-node, a single `ORIGIN` would only allow one of them, so every request is marked as HTTP
 * and SvelteKit takes the host from the request (see PROTOCOL_HEADER/HOST_HEADER in `npm start`).
 */
import http from 'node:http';
import { handler } from './build/handler.js';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

const server = http.createServer((request, response) => {
	request.headers['x-forwarded-proto'] = 'http';
	handler(request, response);
});

server.listen(port, host, () => {
	console.log(`dinoo listening on http://${host}:${port}`);
});
