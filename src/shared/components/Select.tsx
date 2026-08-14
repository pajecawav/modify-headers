import { ComponentProps } from "solid-js";
import { cn } from "../../lib/cn";
import { inputBaseClassName, inputPaddingClasses } from "./Input";

type SelectProps = ComponentProps<"select">;

export const selectBaseClassName = cn(inputBaseClassName, inputPaddingClasses.md);

export const Select = (props: SelectProps) => {
	return <select {...props} class={cn(selectBaseClassName, props.class)} spellcheck={false} />;
};
