import { type JSX, ComponentProps, splitProps } from "solid-js";
import { cn } from "../../lib/cn";
import { useRadioGroupContext } from "./RadioGroupContext";

type RadioProps = Omit<ComponentProps<"label">, "onChange"> & {
	value?: string;
	checked?: boolean;
	name?: string;
	disabled?: boolean;
	onChange?: JSX.ChangeEventHandler<HTMLInputElement, Event>;
};

export const Radio = (props: RadioProps) => {
	const [local, rest] = splitProps(props, [
		"class",
		"children",
		"value",
		"checked",
		"name",
		"disabled",
		"onChange",
	]);

	const ctx = useRadioGroupContext();

	const inputName = () => local.name ?? ctx?.name;
	const isChecked = () => (ctx ? ctx.value === local.value : local.checked);
	const isDisabled = () => local.disabled ?? ctx?.disabled;

	const handleChange: JSX.ChangeEventHandler<HTMLInputElement, Event> = event => {
		if (ctx) {
			ctx.onChange?.(local.value as string);
		}
		local.onChange?.(event);
	};

	return (
		<label
			{...rest}
			class={cn(
				"group flex cursor-pointer items-center rounded-xs",
				"outline-2 outline-transparent outline-offset-0 transition-[outline-offset] duration-150",
				"has-[:focus-visible]:outline-neutral-800 has-[:focus-visible]:outline-offset-2",
				"has-[:active]:outline-offset-0",
				"has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
				"dark:has-[:focus-visible]:outline-neutral-200",
				local.class,
			)}
		>
			<input
				type="radio"
				name={inputName()}
				value={local.value}
				checked={isChecked()}
				disabled={isDisabled()}
				onChange={handleChange}
				class="sr-only"
			/>
			<span
				class={cn(
					"flex h-4 w-4 items-center justify-center rounded-full border border-neutral-800",
					"dark:border-neutral-200",
					"group-has-[:checked]:bg-neutral-800 dark:group-has-[:checked]:bg-neutral-200",
				)}
			>
				<span
					class={cn(
						"invisible h-2 w-2 rounded-full bg-neutral-200 group-has-[:checked]:visible",
						"dark:bg-neutral-800",
					)}
				/>
			</span>
			{local.children && <span class="ml-1.5">{local.children}</span>}
		</label>
	);
};
