import { ComponentProps } from "solid-js";
import { cn } from "../../lib/cn";

type IconButtonProps = ComponentProps<"button">;

export const IconButton = (props: IconButtonProps) => {
	return (
		<button
			{...props}
			class={cn(
				"cursor-pointer rounded-md p-1 transition-colors enabled:hover:bg-neutral-400/25",
				"disabled:cursor-not-allowed",
				props.class,
			)}
		/>
	);
};
