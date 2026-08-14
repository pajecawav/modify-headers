import { ComponentProps, splitProps } from "solid-js";
import { cn } from "../../lib/cn";

type Size = "sm" | "md" | "lg";
type Status = "default" | "error" | "valid";

type InputProps = ComponentProps<"input"> & {
	size?: Size;
	status?: Status;
};

export const inputBaseClassName = cn(
	"w-full rounded-md border bg-white border-neutral-200",
	"focus:outline-none focus:ring-2 focus:ring-neutral-800",
	"placeholder-neutral-400 dark:placeholder-neutral-500",
	"dark:bg-neutral-800 dark:border-neutral-700 dark:focus:ring-neutral-200",
	"disabled:opacity-50",
);

export const inputSizeClasses: Record<Size, string> = {
	sm: "px-2 py-0.5 text-sm",
	md: "px-2 py-1 text-base",
	lg: "p-1.5 text-base",
};

const statusClasses: Record<Status, string> = {
	default: "",
	error: cn(
		"bg-red-50 border-red-600 focus:ring-red-600",
		"dark:bg-red-950 dark:border-red-400 dark:focus:ring-red-400",
	),
	valid: cn(
		"bg-emerald-50 border-emerald-600 focus:ring-emerald-600",
		"dark:bg-emerald-950 dark:border-emerald-400 dark:focus:ring-emerald-400",
	),
};

export const Input = (props: InputProps) => {
	const [local, rest] = splitProps(props, ["size", "status", "class"]);

	return (
		<input
			{...rest}
			class={cn(
				inputBaseClassName,
				inputSizeClasses[local.size ?? "md"],
				statusClasses[local.status ?? "default"],
				local.class,
			)}
			spellcheck={false}
		/>
	);
};
