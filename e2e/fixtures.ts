import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
	test as base,
	chromium,
	type BrowserContext,
	type Page,
	type Worker,
} from "@playwright/test";
import { EchoServer } from "./echo-server";
import { getActiveServiceWorker, getExtensionId } from "./helpers";

const distPath = resolve(import.meta.dirname, "..", "dist");

interface ExtensionFixtures {
	context: BrowserContext;
	page: Page;
	extensionId: string;
	serviceWorker: Worker;
	echoServer: EchoServer;
	echoUrl: string;
}

export const test = base.extend<ExtensionFixtures>({
	context: async ({}, use) => {
		const userDataDir = mkdtempSync(resolve(tmpdir(), "mh-e2e-"));

		const context = await chromium.launchPersistentContext(userDataDir, {
			channel: "chromium",
			args: [
				`--disable-extensions-except=${distPath}`,
				`--load-extension=${distPath}`,
				"--no-sandbox",
				"--disable-dev-shm-usage",
			],
		});

		await use(context);
		await context.close();
		rmSync(userDataDir, { recursive: true, force: true });
	},

	page: async ({ context }, use) => {
		const page = await context.newPage();
		page.on("dialog", dialog => dialog.accept());
		await use(page);
		await page.close();
	},

	serviceWorker: async ({ context }, use) => {
		const worker = await getActiveServiceWorker(context);
		await use(worker);
	},

	extensionId: async ({ serviceWorker }, use) => {
		await use(getExtensionId(serviceWorker));
	},

	echoServer: async ({}, use) => {
		const server = new EchoServer();
		await server.start();
		await use(server);
		await server.stop();
	},

	echoUrl: async ({ echoServer }, use) => {
		await use(echoServer.url);
	},
});

export const expect = test.expect;
