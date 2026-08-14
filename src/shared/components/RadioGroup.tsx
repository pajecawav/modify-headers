import { ComponentProps, createSignal, createUniqueId, splitProps } from "solid-js";
import { cn } from "../../lib/cn";
import { RadioGroupContext, type RadioGroupContextValue } from "./RadioGroupContext";

type RadioGroupProps = Omit<ComponentProps<"div">, "onChange"> & {
	name?: string;
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
};

export const RadioGroup = (props: RadioGroupProps) => {
	const [local, rest] = splitProps(props, [
		"class",
		"name",
		"value",
		"defaultValue",
		"onChange",
		"disabled",
		"children",
	]);

	const autoName = createUniqueId();
	const [internalValue, setInternalValue] = createSignal(local.defaultValue);
	const isControlled = () => local.value !== undefined;
	const currentValue = () => (isControlled() ? local.value : internalValue());

	const contextValue: RadioGroupContextValue = {
		get name() {
			return local.name ?? autoName;
		},
		get value() {
			return currentValue();
		},
		get disabled() {
			return local.disabled;
		},
		onChange: (next: string) => {
			if (!isControlled()) {
				setInternalValue(next);
			}
			local.onChange?.(next);
		},
	};

	return (
		<div {...rest} role="radiogroup" class={cn("flex flex-col gap-3", local.class)}>
			<RadioGroupContext.Provider value={contextValue}>
				{local.children}
			</RadioGroupContext.Provider>
		</div>
	);
};
