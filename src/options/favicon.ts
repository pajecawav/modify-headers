import { createClient } from "werpc";

const client = createClient({ clientName: "options" });

const ICON_LIGHT = "assets/logo32.png";
const ICON_DARK = "assets/logo-white32.png";

const mq = window.matchMedia("(prefers-color-scheme: dark)");

const setFavicon = (dark: boolean) => {
	let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
	if (!link) {
		link = document.createElement("link");
		link.rel = "icon";
		document.head.appendChild(link);
	}
	link.href = dark ? ICON_DARK : ICON_LIGHT;
};

const onChange = (dark: boolean) => {
	setFavicon(dark);
	void client.background.themeChanged.mutate({ dark });
};

export const initFavicon = () => {
	onChange(mq.matches);
	mq.addEventListener("change", e => onChange(e.matches));
};
