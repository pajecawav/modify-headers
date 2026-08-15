const ICONS_LIGHT = {
	16: "assets/logo16.png",
	32: "assets/logo32.png",
	48: "assets/logo48.png",
	128: "assets/logo128.png",
};

const ICONS_DARK = {
	16: "assets/logo-white16.png",
	32: "assets/logo-white32.png",
	48: "assets/logo-white48.png",
	128: "assets/logo-white128.png",
};

const setIcon = (dark: boolean) => {
	void chrome.action.setIcon({ path: dark ? ICONS_DARK : ICONS_LIGHT });
};

let creating: Promise<void> | null = null;

const setupOffscreenDocument = async () => {
	if (!("offscreen" in chrome)) return;

	const offscreenUrl = chrome.runtime.getURL("offscreen.html");
	const existingContexts = await chrome.runtime.getContexts({
		contextTypes: ["OFFSCREEN_DOCUMENT"],
		documentUrls: [offscreenUrl],
	});
	if (existingContexts.length > 0) return;

	if (creating) {
		await creating;
		return;
	}
	creating = chrome.offscreen.createDocument({
		url: "offscreen.html",
		reasons: ["MATCH_MEDIA"],
		justification: "Detect browser color scheme to switch action icon.",
	});
	await creating;
	creating = null;
};

chrome.runtime.onMessage.addListener(message => {
	if (message?.type === "theme-changed") {
		setIcon(message.dark);
	}
	return false;
});

export const initTheme = () => {
	void setupOffscreenDocument();
};
