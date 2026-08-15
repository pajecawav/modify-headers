import "./index.css";
import { render } from "solid-js/web";
import { App } from "./App";
import { initFavicon } from "./favicon";

initFavicon();

const root = document.getElementById("root");
if (!root) {
	throw new Error("Root element #root not found");
}

render(() => <App />, root);
