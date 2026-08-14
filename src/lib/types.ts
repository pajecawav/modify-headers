export type HeaderType = "request" | "response";

export type HeaderOperation = "append" | "set" | "remove";

export type UrlMatcherKind = "urlFilter" | "regexFilter";

export interface RuleCondition {
	urlMatcherKind?: UrlMatcherKind;
	urlFilter?: string;
	regexFilter?: string;
	isUrlFilterCaseSensitive?: boolean;
	resourceTypes?: chrome.declarativeNetRequest.ResourceType[];
	initiatorDomains?: string[];
	requestMethods?: chrome.declarativeNetRequest.RequestMethod[];
	domainType?: chrome.declarativeNetRequest.DomainType;
}

export interface HeaderRule {
	id: string;
	header: string;
	operation: HeaderOperation;
	value?: string;
	headerType: HeaderType;
	condition: RuleCondition;
}

export interface HeaderGroup {
	id: string;
	name: string;
	enabled: boolean;
	rules: HeaderRule[];
}

export interface StoreState {
	groups: HeaderGroup[];
}
