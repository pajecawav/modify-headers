import { nanoid } from "nanoid";
import type { HeaderGroup, HeaderRule } from "./types";

export const createRule = (): HeaderRule => ({
	id: nanoid(),
	header: "",
	operation: "set",
	value: "",
	headerType: "request",
	condition: {},
	enabled: true,
});

export const createGroup = (name = "New group"): HeaderGroup => ({
	id: nanoid(),
	name,
	enabled: true,
	rules: [],
});
