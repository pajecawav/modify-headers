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

export const initFavicon = () => {
	setFavicon(mq.matches);
	mq.addEventListener("change", e => setFavicon(e.matches));
};
