import { ComponentProps, splitProps } from "solid-js";
import { cn } from "../../lib/cn";

type Size = "sm" | "md" | "lg";

export type SwitchProps = Omit<ComponentProps<"button">, "onChange" | "type"> & {
	checked: boolean;
	onChange?: (checked: boolean) => void;
	size?: Size;
};

const trackSizeClasses: Record<Size, string> = {
	sm: "h-6 w-10",
	md: "h-7 w-12",
	lg: "h-8 w-14",
};

const thumbSizeClasses: Record<Size, string> = {
	sm: "h-4 w-4",
	md: "h-5 w-5",
	lg: "h-6 w-6",
};

const thumbCheckedTranslate: Record<Size, string> = {
	sm: "translate-x-4",
	md: "translate-x-5",
	lg: "translate-x-6",
};

export const Switch = (props: SwitchProps) => {
	const [local, rest] = splitProps(props, ["checked", "onChange", "size", "disabled", "class"]);

	const size = () => local.size ?? "md";

	return (
		<button
			{...rest}
			type="button"
			role="switch"
			aria-checked={local.checked}
			disabled={local.disabled}
			onClick={() => local.onChange?.(!local.checked)}
			class={cn(
				"relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2",
				"outline-2 outline-transparent outline-offset-0 transition-colors duration-150",
				"focus-visible:outline-neutral-800 focus-visible:outline-offset-2",
				"dark:focus-visible:outline-neutral-200",
				"disabled:cursor-not-allowed disabled:opacity-50",
				trackSizeClasses[size()],
				local.checked
					? "border-neutral-800 bg-neutral-800 dark:border-neutral-200 dark:bg-neutral-200"
					: "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-800",
				local.class,
			)}
		>
			<span
				class={cn(
					"pointer-events-none block rounded-full transition-transform duration-150",
					thumbSizeClasses[size()],
					local.checked
						? cn(thumbCheckedTranslate[size()], "bg-neutral-100 dark:bg-neutral-800")
						: "translate-x-1 scale-[0.8] bg-neutral-700 dark:bg-neutral-500",
				)}
			/>
		</button>
	);
};
