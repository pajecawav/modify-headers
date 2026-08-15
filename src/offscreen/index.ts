const mq = window.matchMedia("(prefers-color-scheme: dark)");

const send = () => {
	void chrome.runtime.sendMessage({ type: "theme-changed", dark: mq.matches });
};

send();
mq.addEventListener("change", send);
