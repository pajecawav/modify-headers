import { createContext, useContext } from "solid-js";

export interface RadioGroupContextValue {
	name: string;
	value?: string;
	disabled?: boolean;
	onChange?: (value: string) => void;
}

export const RadioGroupContext = createContext<RadioGroupContextValue>();

export const useRadioGroupContext = () => useContext(RadioGroupContext);
