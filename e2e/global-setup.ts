import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const distManifest = resolve(import.meta.dirname, "..", "dist", "manifest.json");

export default async function globalSetup(): Promise<void> {
	execFileSync("pnpm", ["build"], {
		stdio: "inherit",
		cwd: resolve(import.meta.dirname, ".."),
	});

	if (!existsSync(distManifest)) {
		throw new Error("Build did not produce dist/manifest.json");
	}
}
