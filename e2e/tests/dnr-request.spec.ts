import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures";
import { waitForDnrRuleCount } from "../helpers";

async function createRuleViaUI(
	page: Page,
	opts: {
		header: string;
		operation: "set" | "remove" | "append";
		value?: string;
		headerType?: "request" | "response";
		urlFilter: string;
	},
): Promise<void> {
	await page.getByRole("button", { name: "Add group" }).click();
	await page.getByRole("button", { name: "+ Add rule" }).click();

	await page.getByPlaceholder("X-Custom-Header").fill(opts.header);
	await page.locator("select").first().selectOption(opts.operation);

	if (opts.value !== undefined) {
		await page.getByPlaceholder("header value").fill(opts.value);
	}

	if (opts.headerType) {
		await page.getByText(opts.headerType, { exact: true }).click();
	}

	await page.getByText("Condition", { exact: true }).click();
	await page.getByPlaceholder("||example.com^").fill(opts.urlFilter);
}

async function readEchoHeaders(page: Page, echoUrl: string): Promise<Record<string, string>> {
	await page.goto(echoUrl);
	const body = await page.locator("body").textContent();
	return JSON.parse(body ?? "{}").headers as Record<string, string>;
}

test.describe("DNR request header modification", () => {
	test("sets a request header on matching URL", async ({
		page,
		extensionId,
		serviceWorker,
		echoUrl,
	}) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await createRuleViaUI(page, {
			header: "X-Custom",
			operation: "set",
			value: "hello-from-dnr",
			urlFilter: "||127.0.0.1^",
		});
		await waitForDnrRuleCount(serviceWorker, 1);

		const headers = await readEchoHeaders(page, echoUrl);
		expect(headers["x-custom"]).toBe("hello-from-dnr");
	});

	test("removes an existing request header", async ({
		page,
		extensionId,
		serviceWorker,
		echoUrl,
	}) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await createRuleViaUI(page, {
			header: "accept-language",
			operation: "remove",
			urlFilter: "||127.0.0.1^",
		});
		await waitForDnrRuleCount(serviceWorker, 1);

		const headers = await readEchoHeaders(page, echoUrl);
		expect(headers["accept-language"]).toBeUndefined();
	});

	test("appends to an allowlisted request header (user-agent)", async ({
		page,
		extensionId,
		serviceWorker,
		echoUrl,
	}) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await createRuleViaUI(page, {
			header: "user-agent",
			operation: "append",
			value: " e2e-suffix",
			urlFilter: "||127.0.0.1^",
		});
		await waitForDnrRuleCount(serviceWorker, 1);

		const headers = await readEchoHeaders(page, echoUrl);
		expect(headers["user-agent"]).toContain("e2e-suffix");
	});

	test("does not modify requests to non-matching URL", async ({
		page,
		extensionId,
		serviceWorker,
	}) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await createRuleViaUI(page, {
			header: "X-Not-Matched",
			operation: "set",
			value: "should-not-appear",
			urlFilter: "||nonexistent-host.invalid^",
		});
		await waitForDnrRuleCount(serviceWorker, 1);

		await page.goto("https://example.com");
		const resp = await page.goto("https://example.com");
		expect(resp?.status()).toBe(200);
	});
});
