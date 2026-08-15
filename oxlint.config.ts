import { defineOxlintConfig } from "@pajecawav/tools";

export default defineOxlintConfig({
	ignorePatterns: ["**/dist", "**/coverage"],
	overrides: [
		{
			files: ["e2e/**/*.ts"],
			rules: { "no-empty-pattern": "off" },
		},
	],
	rules: {
		"require-post-message-target-origin": "off",
	},
});
