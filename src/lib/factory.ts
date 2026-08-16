import { nanoid } from "nanoid";
import z from "zod";
import { HeaderRule, resourceTypeSchema, type HeaderGroup } from "./types";

const DEFAULT_RESOURCE_TYPES: Array<z.infer<typeof resourceTypeSchema>> = [
	"main_frame",
	"sub_frame",
	"stylesheet",
	"script",
	"image",
	"font",
	"object",
	"xmlhttprequest",
	"ping",
	"media",
];

export const createRule = (): HeaderRule => ({
	id: nanoid(),
	header: "",
	operation: "set",
	value: "",
	headerType: "request",
	condition: { resourceTypes: DEFAULT_RESOURCE_TYPES },
	enabled: true,
});

export const createGroup = (name = "New group"): HeaderGroup => ({
	id: nanoid(),
	name,
	enabled: true,
	rules: [],
});
