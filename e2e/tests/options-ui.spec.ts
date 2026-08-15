import type { StoreState } from "../../src/lib/types";
import { expect, test } from "../fixtures";
import { getDnrRules, getStorage, waitForDnrRuleCount, waitForStorage } from "../helpers";

test.describe("options UI", () => {
	test("shows empty state on first open", async ({ page, extensionId }) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await expect(page.getByRole("heading", { name: "Modify Headers" })).toBeVisible();
		await expect(page.getByText("No groups yet")).toBeVisible();
	});

	test("adds a group and persists it", async ({ page, extensionId, serviceWorker }) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await page.getByRole("button", { name: "Add group" }).click();

		await expect(page.getByPlaceholder("Group name")).toBeVisible();
		await expect(page.getByText("0 rules")).toBeVisible();

		await waitForStorage<StoreState>(serviceWorker, s => s.groups.length === 1);

		const state = await getStorage<StoreState>(serviceWorker);
		expect(state.groups).toHaveLength(1);
		expect(state.groups[0].name).toBe("New group");
		expect(state.groups[0].rules).toHaveLength(0);
	});

	test("adds a rule with header and value, persists after debounce", async ({
		page,
		extensionId,
		serviceWorker,
	}) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await page.getByRole("button", { name: "Add group" }).click();
		await page.getByRole("button", { name: "+ Add rule" }).click();

		await expect(page.getByPlaceholder("X-Custom-Header")).toBeVisible();
		await page.getByPlaceholder("X-Custom-Header").fill("X-Custom");
		await page.getByPlaceholder("header value").fill("hello-value");

		await waitForDnrRuleCount(serviceWorker, 1);

		const state = await getStorage<StoreState>(serviceWorker);
		expect(state.groups).toHaveLength(1);
		expect(state.groups[0].rules).toHaveLength(1);
		expect(state.groups[0].rules[0].header).toBe("X-Custom");
		expect(state.groups[0].rules[0].value).toBe("hello-value");
		expect(state.groups[0].rules[0].operation).toBe("set");
		expect(state.groups[0].rules[0].headerType).toBe("request");

		const rules = await getDnrRules(serviceWorker);
		expect(rules).toHaveLength(1);
		expect(rules[0].action.requestHeaders?.[0].header).toBe("X-Custom");
		expect(rules[0].action.requestHeaders?.[0].value).toBe("hello-value");
	});

	test("toggling group off removes its DNR rules", async ({
		page,
		extensionId,
		serviceWorker,
	}) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await page.getByRole("button", { name: "Add group" }).click();
		await page.getByRole("button", { name: "+ Add rule" }).click();
		await page.getByPlaceholder("X-Custom-Header").fill("X-Test");
		await page.getByPlaceholder("header value").fill("val");

		await waitForDnrRuleCount(serviceWorker, 1);

		await page
			.locator("label", { has: page.locator('input[title="Enabled"]') })
			.first()
			.click();

		await waitForDnrRuleCount(serviceWorker, 0);

		const state = await getStorage<StoreState>(serviceWorker);
		expect(state.groups[0].enabled).toBe(false);
	});

	test("toggling all off empties DNR rules", async ({ page, extensionId, serviceWorker }) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await page.getByRole("button", { name: "Add group" }).click();
		await page.getByRole("button", { name: "+ Add rule" }).click();
		await page.getByPlaceholder("X-Custom-Header").fill("X-All");
		await page.getByPlaceholder("header value").fill("v");
		await waitForDnrRuleCount(serviceWorker, 1);

		await page.getByRole("switch", { name: "Toggle all rules" }).click();

		await waitForDnrRuleCount(serviceWorker, 0);

		const state = await getStorage<StoreState>(serviceWorker);
		expect(state.enabled).toBe(false);
	});

	test("deletes a group via confirm dialog", async ({ page, extensionId, serviceWorker }) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await page.getByRole("button", { name: "Add group" }).click();
		await waitForStorage<StoreState>(serviceWorker, s => s.groups.length === 1);

		await page.getByRole("button", { name: "Delete" }).first().click();

		await expect(page.getByText("No groups yet")).toBeVisible();

		await waitForStorage<StoreState>(serviceWorker, s => s.groups.length === 0);
	});

	test("rename group persists", async ({ page, extensionId, serviceWorker }) => {
		await page.goto(`chrome-extension://${extensionId}/options.html`);

		await page.getByRole("button", { name: "Add group" }).click();
		await page.getByPlaceholder("Group name").fill("My API rules");

		await waitForStorage<StoreState>(
			serviceWorker,
			s => s.groups.length === 1 && s.groups[0].name === "My API rules",
		);

		const state = await getStorage<StoreState>(serviceWorker);
		expect(state.groups[0].name).toBe("My API rules");
	});
});
