import type { StoreState } from "../../src/lib/types";
import { expect, test } from "../fixtures";
import {
	evictServiceWorker,
	getActiveServiceWorker,
	getDnrRules,
	getStorage,
	waitForDnrRuleCount,
} from "../helpers";

test.describe("persistence across service worker eviction", () => {
	test("DNR rules survive SW eviction and restart", async ({
		page,
		context,
		extensionId,
		serviceWorker,
	}) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await page.getByRole("button", { name: "Add group" }).click();
		await page.getByRole("button", { name: "+ Add rule" }).click();
		await page.getByPlaceholder("X-Custom-Header").fill("X-Persist");
		await page.getByPlaceholder("header value").fill("survives");
		await page.getByText("Condition", { exact: true }).click();
		await page.getByPlaceholder("||example.com^").fill("||127.0.0.1^");

		await waitForDnrRuleCount(serviceWorker, 1);

		await evictServiceWorker(context);

		await page.goto(`chrome-extension://${extensionId}/options.html`);

		const newWorker = await getActiveServiceWorker(context);
		await waitForDnrRuleCount(newWorker, 1);

		const rules = await getDnrRules(newWorker);
		expect(rules[0].action.requestHeaders?.[0].header).toBe("X-Persist");

		const state = await getStorage<StoreState>(newWorker);
		expect(state.groups).toHaveLength(1);
		expect(state.groups[0].rules[0].header).toBe("X-Persist");

		await page.reload();
		await expect(page.getByPlaceholder("Group name")).toBeVisible();
		await expect(page.getByPlaceholder("X-Custom-Header")).toHaveValue("X-Persist");
	});
});
