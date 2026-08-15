import { createClient } from "werpc";

const client = createClient({ clientName: "offscreen" });

const mq = window.matchMedia("(prefers-color-scheme: dark)");

const send = () => {
	void client.background.themeChanged.mutate({ dark: mq.matches });
};

send();
mq.addEventListener("change", send);
