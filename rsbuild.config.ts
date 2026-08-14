import { defineConfig } from "@rsbuild/core";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginSolid } from "@rsbuild/plugin-solid";

export default defineConfig({
	plugins: [
		pluginBabel({
			include: /\.(?:jsx|tsx)$/,
		}),
		pluginSolid(),
	],
	html: {
		title: "Modify Headers",
	},
	source: {
		entry: {
			background: {
				import: "./src/background",
				html: false,
			},
			options: "./src/options/index.tsx",
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
