import { ComponentProps, PropsWithChildren, splitProps } from "solid-js";
import { cn } from "../../lib/cn";

type CheckboxProps = ComponentProps<"input"> & PropsWithChildren;

export const Checkbox = (props: CheckboxProps) => {
	const [local, rest] = splitProps(props, ["class", "children"]);

	return (
		<label
			class={cn(
				"group flex cursor-pointer items-center rounded-xs",
				"outline-2 outline-transparent outline-offset-0 transition-[outline-offset] duration-150",
				"has-[:focus-visible]:outline-neutral-800 has-[:focus-visible]:outline-offset-2",
				"has-[:active]:outline-offset-0",
				"dark:has-[:focus-visible]:outline-neutral-200",
				local.class,
			)}
		>
			<input {...rest} type="checkbox" class="sr-only" />
			<span
				class={cn(
					"inline-flex items-center justify-center rounded-md border border-neutral-800",
					"dark:border-neutral-200",
					"group-has-[:checked]:bg-neutral-800 dark:group-has-[:checked]:bg-neutral-200",
				)}
			>
				<svg
					viewBox="0 0 16 16"
					fill="currentColor"
					class={cn(
						"invisible h-4 w-4 text-neutral-200 group-has-[:checked]:visible",
						"dark:text-neutral-800",
					)}
				>
					<path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06 0L2.22 9.78a.75.75 0 0 1 1.06-1.06L6 11.19l6.72-6.97a.75.75 0 0 1 1.06 0Z" />
				</svg>
			</span>
			{local.children && <span class="ml-1.5">{local.children}</span>}
		</label>
	);
};
