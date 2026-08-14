import { defineConfig } from "@rsbuild/core";

export default defineConfig({
	source: {
		entry: {
			background: {
				import: "./src/background",
				html: false,
			},
			options: "./src/options",
		},
	},
	output: {
		minify: false,
		sourceMap: true,
		filenameHash: false,
		distPath: {
			root: "dist",
			js: "./",
			jsAsync: "./",
		},
		copy: ["./src/manifest.json"],
	},
	performance: {
		chunkSplit: {
			strategy: "all-in-one",
		},
	},
});
