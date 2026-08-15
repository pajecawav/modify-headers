import { nanoid } from "nanoid";
import { resourceTypeSchema, type HeaderGroup, HeaderRule } from "./types";

export const createRule = (): HeaderRule => ({
	id: nanoid(),
	header: "",
	operation: "set",
	value: "",
	headerType: "request",
	condition: { resourceTypes: resourceTypeSchema.options },
	enabled: true,
});

export const createGroup = (name = "New group"): HeaderGroup => ({
	id: nanoid(),
	name,
	enabled: true,
	rules: [],
});
