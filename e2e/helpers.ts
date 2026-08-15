import type { BrowserContext, Worker } from "@playwright/test";

const STORAGE_KEY = "modify-headers-state";

export async function getActiveServiceWorker(
	context: BrowserContext,
	timeoutMs = 10_000,
): Promise<Worker> {
	const existing = context
		.serviceWorkers()
		.filter(w => w.url().startsWith("chrome-extension://"));
	if (existing.length > 0) {
		try {
			await existing[0].evaluate(() => true);
			return existing[0];
		} catch {
			// evicted, fall through to wait for re-registration
		}
	}
	return context.waitForEvent("serviceworker", { timeout: timeoutMs });
}

export function getExtensionId(worker: Worker): string {
	const url = new URL(worker.url());
	if (url.protocol !== "chrome-extension:") {
		throw new Error(`Unexpected worker URL scheme: ${worker.url()}`);
	}
	return url.hostname;
}

export async function getDnrRules(worker: Worker): Promise<chrome.declarativeNetRequest.Rule[]> {
	return worker.evaluate(() => chrome.declarativeNetRequest.getDynamicRules());
}

export async function getStorage<T = unknown>(worker: Worker): Promise<T> {
	const result = await worker.evaluate(async key => {
		const res = await chrome.storage.local.get(key);
		return res[key] as unknown;
	}, STORAGE_KEY);
	return result as T;
}

export async function seedStorage(worker: Worker, state: unknown): Promise<void> {
	await worker.evaluate(
		async ({ key, value }) => {
			await chrome.storage.local.set({ [key]: value });
		},
		{ key: STORAGE_KEY, value: state },
	);
}

export async function waitForDnrRuleCount(
	worker: Worker,
	expected: number,
	timeoutMs = 3_000,
): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const rules = await getDnrRules(worker);
		if (rules.length === expected) return;
		await new Promise(r => setTimeout(r, 100));
	}
	const rules = await getDnrRules(worker);
	throw new Error(
		`Expected ${expected} DNR rules, got ${rules.length}: ${JSON.stringify(rules)}`,
	);
}

export async function waitForStorage<T>(
	worker: Worker,
	predicate: (state: T) => boolean,
	timeoutMs = 3_000,
): Promise<T> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const state = await getStorage<T>(worker);
		if (predicate(state)) return state;
		await new Promise(r => setTimeout(r, 100));
	}
	const state = await getStorage<T>(worker);
	if (!predicate(state)) {
		throw new Error(`Storage predicate never satisfied. Last state: ${JSON.stringify(state)}`);
	}
	return state;
}

export async function evictServiceWorker(context: BrowserContext): Promise<void> {
	const page = context.pages()[0] ?? (await context.newPage());
	const cdp = await context.newCDPSession(page);
	try {
		await cdp.send("ServiceWorker.enable");
		await cdp.send("ServiceWorker.stopAllWorkers");
	} finally {
		await cdp.detach().catch(() => {});
		if (page !== context.pages()[0]) {
			await page.close();
		}
	}
}
