import { z } from "zod";

const resourceTypeSchema = z.enum([
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
]);

const requestMethodSchema = z.enum([
	"connect",
	"delete",
	"get",
	"head",
	"options",
	"patch",
	"post",
	"put",
	"other",
]);

const domainTypeSchema = z.enum(["firstParty", "thirdParty"]);

export const headerTypeSchema = z.enum(["request", "response"]);
export const headerOperationSchema = z.enum(["append", "set", "remove"]);
export const urlMatcherKindSchema = z.enum(["urlFilter", "regexFilter"]);

export const ruleConditionSchema = z.object({
	urlMatcherKind: urlMatcherKindSchema.optional(),
	urlFilter: z.string().optional(),
	regexFilter: z.string().optional(),
	isUrlFilterCaseSensitive: z.boolean().optional(),
	resourceTypes: z.array(resourceTypeSchema).optional(),
	initiatorDomains: z.array(z.string()).optional(),
	requestMethods: z.array(requestMethodSchema).optional(),
	domainType: domainTypeSchema.optional(),
});

export const headerRuleSchema = z.object({
	id: z.string(),
	header: z.string(),
	operation: headerOperationSchema,
	value: z.string().optional(),
	headerType: headerTypeSchema,
	condition: ruleConditionSchema,
});

export const headerGroupSchema = z.object({
	id: z.string(),
	name: z.string(),
	enabled: z.boolean(),
	rules: z.array(headerRuleSchema),
});

export const storeStateSchema = z.object({
	groups: z.array(headerGroupSchema),
});

export type HeaderType = z.infer<typeof headerTypeSchema>;
export type HeaderOperation = z.infer<typeof headerOperationSchema>;
export type UrlMatcherKind = z.infer<typeof urlMatcherKindSchema>;
export type RuleCondition = z.infer<typeof ruleConditionSchema>;
export type HeaderRule = z.infer<typeof headerRuleSchema>;
export type HeaderGroup = z.infer<typeof headerGroupSchema>;
export type StoreState = z.infer<typeof storeStateSchema>;
