import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures";
import { waitForDnrRuleCount } from "../helpers";

async function createResponseRule(
	page: Page,
	opts: {
		header: string;
		operation: "set" | "remove" | "append";
		value?: string;
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

	await page.getByText("response", { exact: true }).click();

	await page.getByText("Condition", { exact: true }).click();
	await page.getByPlaceholder("||example.com^").fill(opts.urlFilter);
}

async function readResponseHeader(
	page: Page,
	echoUrl: string,
	name: string,
): Promise<string | null> {
	await page.goto(echoUrl);
	return page.evaluate(
		async ({ url, header }) => {
			const r = await fetch(url);
			return r.headers.get(header);
		},
		{ url: echoUrl, header: name },
	);
}

test.describe("DNR response header modification", () => {
	test("sets a response header seen by the page", async ({
		page,
		extensionId,
		serviceWorker,
		echoServer,
		echoUrl,
	}) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await createResponseRule(page, {
			header: echoServer.responseHeaderName,
			operation: "set",
			value: "modified-by-extension",
			urlFilter: "||127.0.0.1^",
		});
		await waitForDnrRuleCount(serviceWorker, 1);

		const value = await readResponseHeader(page, echoUrl, echoServer.responseHeaderName);
		expect(value).toBe("modified-by-extension");
	});

	test("removes a response header so the page does not see it", async ({
		page,
		extensionId,
		serviceWorker,
		echoServer,
		echoUrl,
	}) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await createResponseRule(page, {
			header: echoServer.responseHeaderName,
			operation: "remove",
			urlFilter: "||127.0.0.1^",
		});
		await waitForDnrRuleCount(serviceWorker, 1);

		const value = await readResponseHeader(page, echoUrl, echoServer.responseHeaderName);
		expect(value).toBeNull();
	});
});
