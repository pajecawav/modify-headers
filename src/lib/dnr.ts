import type { HeaderRule, StoreState } from "./types";

const buildCondition = (rule: HeaderRule): chrome.declarativeNetRequest.RuleCondition => {
	const c = rule.condition;
	const condition: chrome.declarativeNetRequest.RuleCondition = {};

	if (c.urlMatcherKind === "regexFilter" && c.regexFilter) {
		condition.regexFilter = c.regexFilter;
	} else if (c.urlFilter) {
		condition.urlFilter = c.urlFilter;
	}

	if (c.isUrlFilterCaseSensitive !== undefined) {
		condition.isUrlFilterCaseSensitive = c.isUrlFilterCaseSensitive;
	}
	if (c.resourceTypes?.length) {
		condition.resourceTypes = c.resourceTypes;
	}
	if (c.initiatorDomains?.length) {
		condition.initiatorDomains = c.initiatorDomains;
	}
	if (c.requestMethods?.length) {
		condition.requestMethods = c.requestMethods;
	}
	if (c.domainType) {
		condition.domainType = c.domainType;
	}

	return condition;
};

const ruleToDnr = (rule: HeaderRule, ruleId: number): chrome.declarativeNetRequest.Rule => {
	const headerInfo: chrome.declarativeNetRequest.ModifyHeaderInfo = {
		header: rule.header,
		operation: rule.operation,
	};
	if (rule.operation !== "remove" && rule.value !== undefined) {
		headerInfo.value = rule.value;
	}

	const action: chrome.declarativeNetRequest.RuleAction = {
		type: "modifyHeaders",
	};
	if (rule.headerType === "request") {
		action.requestHeaders = [headerInfo];
	} else {
		action.responseHeaders = [headerInfo];
	}

	return {
		id: ruleId,
		priority: 1,
		condition: buildCondition(rule),
		action,
	};
};

export const stateToRules = (state: StoreState): chrome.declarativeNetRequest.Rule[] => {
	const rules: chrome.declarativeNetRequest.Rule[] = [];
	let nextId = 1;

	for (const group of state.groups) {
		if (!group.enabled) {
			continue;
		}
		for (const rule of group.rules) {
			rules.push(ruleToDnr(rule, nextId++));
		}
	}

	return rules;
};

export const applyDnr = async (state: StoreState): Promise<void> => {
	const existing = await chrome.declarativeNetRequest.getDynamicRules();
	const removeRuleIds = existing.map(r => r.id);
	const addRules = stateToRules(state);

	await chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds,
		addRules,
	});
};
