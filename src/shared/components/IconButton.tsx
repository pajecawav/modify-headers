import { Button, type ButtonProps } from "./Button";

type IconButtonProps = Omit<ButtonProps, "icon">;

export const IconButton = (props: IconButtonProps) => {
	return <Button icon {...props} />;
};
