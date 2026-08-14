import { ComponentProps, JSX, splitProps } from "solid-js";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "dashed" | "link";
type Appearance = "neutral" | "positive" | "negative";
type Size = "sm" | "md" | "lg";

export type ButtonProps = ComponentProps<"button"> & {
	variant?: Variant;
	appearance?: Appearance;
	size?: Size;
	icon?: boolean;
	loading?: boolean;
	before?: JSX.Element;
	after?: JSX.Element;
};

const focusRing = cn(
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800",
	"dark:focus-visible:ring-neutral-200",
);

const variantClasses: Record<Appearance, Record<Variant, string>> = {
	neutral: {
		primary: cn(
			"bg-neutral-800 text-neutral-100 hover:bg-neutral-600",
			"dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300",
		),
		secondary: cn(
			"bg-neutral-200 text-neutral-800 hover:bg-neutral-300",
			"dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
		),
		ghost: cn(
			"text-neutral-800 hover:bg-neutral-200",
			"dark:text-neutral-200 dark:hover:bg-neutral-800",
		),
		outline: cn(
			"border border-neutral-300 text-neutral-800 hover:bg-neutral-200",
			"dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800",
		),
		dashed: cn(
			"border border-dashed border-neutral-400 text-neutral-800 hover:border-neutral-700",
			"dark:border-neutral-600 dark:text-neutral-200 dark:hover:border-neutral-400",
		),
		link: cn(
			"text-neutral-800 hover:text-neutral-600",
			"dark:text-neutral-200 dark:hover:text-neutral-300",
		),
	},
	positive: {
		primary: cn(
			"bg-emerald-600 text-white hover:bg-emerald-700",
			"dark:bg-emerald-400 dark:text-neutral-900 dark:hover:bg-emerald-300",
		),
		secondary: cn(
			"bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
			"dark:bg-emerald-900 dark:text-emerald-200 dark:hover:bg-emerald-800",
		),
		ghost: cn(
			"text-emerald-600 hover:bg-emerald-100",
			"dark:text-emerald-400 dark:hover:bg-emerald-900",
		),
		outline: cn(
			"border border-emerald-300 text-emerald-600 hover:bg-emerald-100",
			"dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900",
		),
		dashed: cn(
			"border border-dashed border-emerald-400 text-emerald-600 hover:border-emerald-600",
			"dark:border-emerald-600 dark:text-emerald-400 dark:hover:border-emerald-400",
		),
		link: cn(
			"text-emerald-600 hover:text-emerald-700",
			"dark:text-emerald-400 dark:hover:text-emerald-300",
		),
	},
	negative: {
		primary: cn(
			"bg-red-600 text-white hover:bg-red-700",
			"dark:bg-red-400 dark:text-neutral-900 dark:hover:bg-red-300",
		),
		secondary: cn(
			"bg-red-100 text-red-800 hover:bg-red-200",
			"dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800",
		),
		ghost: cn("text-red-600 hover:bg-red-100", "dark:text-red-400 dark:hover:bg-red-900"),
		outline: cn(
			"border border-red-300 text-red-600 hover:bg-red-100",
			"dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900",
		),
		dashed: cn(
			"border border-dashed border-red-400 text-red-600 hover:border-red-600",
			"dark:border-red-600 dark:text-red-400 dark:hover:border-red-400",
		),
		link: cn("text-red-600 hover:text-red-700", "dark:text-red-400 dark:hover:text-red-300"),
	},
};

const sizeClasses: Record<Size, string> = {
	sm: "text-sm px-2 py-1",
	md: "text-base px-2.5 py-1.5",
	lg: "text-lg px-2.5 py-2",
};

const iconSizeClasses: Record<Size, string> = {
	sm: "text-sm p-1",
	md: "text-base p-1.5",
	lg: "text-lg p-2",
};

export const Button = (props: ButtonProps) => {
	const [local, rest] = splitProps(props, [
		"variant",
		"appearance",
		"size",
		"icon",
		"loading",
		"disabled",
		"type",
		"class",
		"children",
		"before",
		"after",
	]);

	const variant = () => local.variant ?? "primary";
	const appearance = () => local.appearance ?? "neutral";
	const size = () => local.size ?? "md";

	const padding = () => {
		if (variant() === "link") return "p-0";
		return local.icon ? iconSizeClasses[size()] : sizeClasses[size()];
	};

	return (
		<button
			{...rest}
			type={local.type ?? "button"}
			disabled={local.disabled || local.loading}
			class={cn(
				"relative inline-flex cursor-pointer select-none items-center justify-center rounded-md",
				"transition-colors disabled:cursor-not-allowed disabled:opacity-50",
				focusRing,
				padding(),
				variantClasses[appearance()][variant()],
				local.loading && "cursor-progress",
				local.class,
			)}
		>
			<span class={cn("flex items-center gap-1", local.loading && "invisible")}>
				{local.before}
				{local.children}
				{local.after}
			</span>
			{local.loading && (
				<span class="absolute inset-0 flex items-center justify-center">
					<span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
				</span>
			)}
		</button>
	);
};
