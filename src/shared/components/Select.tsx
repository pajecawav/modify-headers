import { ComponentProps, splitProps } from "solid-js";
import { cn } from "../../lib/cn";
import { inputBaseClassName, inputSizeClasses } from "./Input";

type Size = keyof typeof inputSizeClasses;

type SelectProps = ComponentProps<"select"> & {
	size?: Size;
};

export const selectBaseClassName = cn(inputBaseClassName, inputSizeClasses.md);

export const Select = (props: SelectProps) => {
	const [local, rest] = splitProps(props, ["size", "class"]);

	return (
		<select
			{...rest}
			class={cn(inputBaseClassName, inputSizeClasses[local.size ?? "md"], local.class)}
			spellcheck={false}
		/>
	);
};
