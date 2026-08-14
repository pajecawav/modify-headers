import { ComponentProps, splitProps } from "solid-js";
import { cn } from "../../lib/cn";

type InputProps = ComponentProps<"input"> & {
	padding?: keyof typeof inputPaddingClasses;
};

export const inputBaseClassName = cn(
	"min-h-9 outline-offset-0 rounded-md dark:placeholder-neutral-400",
	"border border-neutral-200 dark:border-neutral-600",
	"bg-neutral-100 dark:bg-neutral-700",
);

export const inputPaddingClasses = {
	sm: "px-2 py-1",
	md: "p-2",
};

export const Input = (props: InputProps) => {
	const [local, rest] = splitProps(props, ["padding"]);

	return (
		<input
			{...rest}
			class={cn(inputBaseClassName, props.class, inputPaddingClasses[local.padding ?? "md"])}
			spellcheck={false}
		/>
	);
};
