import { createLogger } from "./logger";

const logger = createLogger("background");

chrome.runtime.onInstalled.addListener(details => {
	logger.log("installed", details.reason);
});
