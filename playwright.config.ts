import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	globalSetup: "./e2e/global-setup.ts",
	fullyParallel: true,
	retries: 0,
	reporter: [
		[process.env.CI ? "github" : "list"],
		["html", { outputFolder: "playwright-report" }],
	],
	use: {
		channel: "chromium",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},
});
