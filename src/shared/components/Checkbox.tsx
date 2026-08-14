import { ComponentProps, PropsWithChildren, splitProps } from "solid-js";
import { cn } from "../../lib/cn";

type CheckboxProps = ComponentProps<"input"> & PropsWithChildren;

export const Checkbox = (props: CheckboxProps) => {
	const [local, rest] = splitProps(props, ["class", "children"]);

	return (
		<label class={cn("flex items-center gap-2", local.class)}>
			<input
				type="checkbox"
				class="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
				{...rest}
			/>
			<span>{local.children}</span>
		</label>
	);
};
