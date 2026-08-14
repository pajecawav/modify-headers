import { ComponentProps } from "solid-js";
import { cn } from "../../lib/cn";

type ButtonProps = ComponentProps<"button"> & {
	size?: "sm" | "md";
	loading?: boolean;
};

const sizeClasses = {
	sm: "px-2 py-1",
	md: "px-3 py-2",
};

export const Button = (props: ButtonProps) => {
	return (
		<button
			{...props}
			class={cn(
				"relative",
				"cursor-pointer rounded-md text-neutral-100 transition-colors",
				"bg-neutral-800 hover:bg-neutral-700",
				"dark:bg-neutral-700 dark:hover:bg-neutral-600",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				props.loading && "cursor-progress",
				sizeClasses[props.size ?? "md"],
				props.class,
			)}
			disabled={props.disabled || props.loading}
		>
			<span class={cn(props.loading && "invisible")}>{props.children}</span>
			{props.loading && (
				<span class="absolute inset-0 flex items-center justify-center">...</span>
			)}
		</button>
	);
};
