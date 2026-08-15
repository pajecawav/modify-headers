import { stateToRules } from "./dnr";
import type { StoreState } from "./types";

const BADGE_COLOR_ACTIVE = "#f59e0b";
const BADGE_COLOR_INACTIVE = "#ef4444";

export const applyBadge = (state: StoreState): void => {
	if (!state.enabled) {
		void chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR_INACTIVE });
		void chrome.action.setBadgeText({ text: " " });
		return;
	}

	const count = stateToRules(state).length;
	if (count > 0) {
		void chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR_ACTIVE });
		void chrome.action.setBadgeText({ text: String(count) });
	} else {
		void chrome.action.setBadgeText({ text: "" });
	}
};
