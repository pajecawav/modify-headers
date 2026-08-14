import { createHandler, type InferNamespace } from "werpc";
import { createLogger } from "./lib/logger";
import { backgroundRouter } from "./lib/router";
import { store } from "./lib/store";

const logger = createLogger("background");

export const handler = createHandler({
	namespace: "background",
	router: backgroundRouter,
});

declare module "werpc" {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface WERPCNamespaces extends InferNamespace<typeof handler> {}
}

chrome.runtime.onInstalled.addListener(async details => {
	logger.log("installed", details.reason);
	await store.load();
});

chrome.action.onClicked.addListener(() => {
	void chrome.runtime.openOptionsPage();
});

void (async () => {
	const state = await store.load();
	const { applyDnr } = await import("./lib/dnr");
	await applyDnr(state);
	logger.log("hydrated", state.groups.length, "groups");
})();
