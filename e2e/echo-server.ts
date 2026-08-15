import { createServer, type Server } from "node:http";
import type { Socket } from "node:net";

const RESPONSE_HEADER_NAME = "x-test-resp";
const RESPONSE_HEADER_VALUE = "original";

export class EchoServer {
	private server: Server | undefined;
	private port = 0;
	private readonly sockets = new Set<Socket>();

	public get url(): string {
		return `http://127.0.0.1:${this.port}/`;
	}

	public get responseHeaderName(): string {
		return RESPONSE_HEADER_NAME;
	}

	public get responseHeaderValue(): string {
		return RESPONSE_HEADER_VALUE;
	}

	public async start(): Promise<void> {
		this.server = createServer((req, res) => {
			const headers: Record<string, string> = {};
			for (const [key, value] of Object.entries(req.headers)) {
				if (typeof value === "string") {
					headers[key] = value;
				}
			}

			res.setHeader(RESPONSE_HEADER_NAME, RESPONSE_HEADER_VALUE);
			res.setHeader("content-type", "application/json");
			res.end(JSON.stringify({ headers }));
		});

		this.server.on("connection", socket => {
			this.sockets.add(socket);
			socket.on("close", () => this.sockets.delete(socket));
		});

		await new Promise<void>(resolve => {
			this.server!.listen(0, "127.0.0.1", resolve);
		});

		const addr = this.server.address();
		if (addr === null || typeof addr === "string") {
			throw new Error("Failed to bind echo server");
		}
		this.port = addr.port;
	}

	public async stop(): Promise<void> {
		if (!this.server) return;
		for (const socket of this.sockets) {
			socket.destroy();
		}
		this.sockets.clear();
		await new Promise<void>(resolve => this.server!.close(() => resolve()));
		this.server = undefined;
	}
}
