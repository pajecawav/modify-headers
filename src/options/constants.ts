export const RESOURCE_TYPES: chrome.declarativeNetRequest.ResourceType[] = [
	"main_frame",
	"sub_frame",
	"stylesheet",
	"script",
	"image",
	"font",
	"object",
	"xmlhttprequest",
	"ping",
	"csp_report",
	"media",
	"websocket",
	"webtransport",
	"webbundle",
	"other",
];

export const REQUEST_METHODS: chrome.declarativeNetRequest.RequestMethod[] = [
	"connect",
	"delete",
	"get",
	"head",
	"options",
	"patch",
	"post",
	"put",
	"other",
];

export const DOMAIN_TYPES: chrome.declarativeNetRequest.DomainType[] = ["firstParty", "thirdParty"];
