import type { JSX } from "solid-js";
import { cn } from "../lib/cn";
import type { HeaderOperation, HeaderRule, HeaderType, UrlMatcherKind } from "../lib/types";
import { Button } from "../shared/components/Button";
import { Checkbox } from "../shared/components/Checkbox";
import { Input } from "../shared/components/Input";
import { Radio } from "../shared/components/Radio";
import { Select } from "../shared/components/Select";
import { DOMAIN_TYPES, REQUEST_METHODS, RESOURCE_TYPES } from "./constants";

interface Props {
	rule: HeaderRule;
	onChange: (rule: HeaderRule) => void;
	onDelete: () => void;
}

const labelClass = "font-medium text-neutral-500 dark:text-neutral-400";

const OPERATIONS: HeaderOperation[] = ["append", "set", "remove"];
const HEADER_TYPES: HeaderType[] = ["request", "response"];
const MATCHER_KINDS: UrlMatcherKind[] = ["urlFilter", "regexFilter"];

export const RuleRow = (props: Props): JSX.Element => {
	const update = (patch: Partial<HeaderRule>): void => {
		props.onChange({ ...props.rule, ...patch });
	};

	const updateCondition = (patch: Partial<HeaderRule["condition"]>): void => {
		props.onChange({
			...props.rule,
			condition: { ...props.rule.condition, ...patch },
		});
	};

	const toggleArray = <T,>(arr: T[] | undefined, value: T): T[] => {
		const set = new Set(arr ?? []);
		if (set.has(value)) {
			set.delete(value);
		} else {
			set.add(value);
		}
		return [...set];
	};

	return (
		<div
			class={cn(
				"rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900",
				props.rule.enabled ? "" : "opacity-50",
			)}
		>
			<div class="grid grid-cols-[auto_1fr_1fr_2fr_auto] items-stretch gap-2">
				<div class="flex flex-col gap-1">
					<span class={labelClass}>On</span>
					<Checkbox
						class="flex-1"
						checked={props.rule.enabled}
						onChange={e => update({ enabled: e.currentTarget.checked })}
						title={props.rule.enabled ? "Enabled" : "Disabled"}
					/>
				</div>
				<label class="flex flex-col gap-1">
					<span class={labelClass}>Header</span>
					<Input
						placeholder="X-Custom-Header"
						value={props.rule.header}
						onInput={e => update({ header: e.currentTarget.value })}
					/>
				</label>
				<label class="flex flex-col gap-1">
					<span class={labelClass}>Operation</span>
					<Select
						value={props.rule.operation}
						onChange={e =>
							update({
								operation: e.currentTarget.value as HeaderOperation,
							})
						}
					>
						{OPERATIONS.map(op => (
							<option value={op}>{op}</option>
						))}
					</Select>
				</label>
				{props.rule.operation === "remove" ? (
					<span />
				) : (
					<label class="flex flex-col gap-1">
						<span class={labelClass}>Value</span>
						<Input
							placeholder="header value"
							value={props.rule.value ?? ""}
							onInput={e => update({ value: e.currentTarget.value })}
						/>
					</label>
				)}
				<div>
					<Button
						variant="ghost"
						appearance="negative"
						size="sm"
						onClick={() => {
							if (confirm("Delete this rule?")) {
								props.onDelete();
							}
						}}
					>
						Delete
					</Button>
				</div>
			</div>

			<div class="mt-3 flex flex-wrap items-center gap-4">
				<span class={labelClass}>Header type:</span>
				{HEADER_TYPES.map(ht => (
					<Radio
						name={`headerType-${props.rule.id}`}
						checked={props.rule.headerType === ht}
						onChange={() => update({ headerType: ht })}
					>
						<span class="capitalize">{ht}</span>
					</Radio>
				))}
			</div>

			<details class="mt-2">
				<summary class="cursor-pointer font-medium text-neutral-500 dark:text-neutral-400">
					Condition
				</summary>
				<div class="mt-2 space-y-3">
					<div class="flex flex-wrap items-center gap-4">
						<span class={labelClass}>URL matcher:</span>
						{MATCHER_KINDS.map(kind => (
							<Radio
								name={`matcher-${props.rule.id}`}
								checked={
									props.rule.condition.urlMatcherKind === kind ||
									(!props.rule.condition.urlMatcherKind && kind === "urlFilter")
								}
								onChange={() => updateCondition({ urlMatcherKind: kind })}
							>
								<span>{kind}</span>
							</Radio>
						))}
						<Checkbox
							checked={props.rule.condition.isUrlFilterCaseSensitive ?? false}
							onChange={e =>
								updateCondition({
									isUrlFilterCaseSensitive: e.currentTarget.checked,
								})
							}
						>
							case sensitive
						</Checkbox>
					</div>

					{props.rule.condition.urlMatcherKind === "regexFilter" ? (
						<label class="flex flex-col gap-1">
							<span class={labelClass}>Regex filter (RE2)</span>
							<Input
								placeholder="^https?://example\\.com/.*"
								value={props.rule.condition.regexFilter ?? ""}
								onInput={e =>
									updateCondition({ regexFilter: e.currentTarget.value })
								}
							/>
						</label>
					) : (
						<label class="flex flex-col gap-1">
							<span class={labelClass}>URL filter</span>
							<Input
								placeholder="||example.com^"
								value={props.rule.condition.urlFilter ?? ""}
								onInput={e => updateCondition({ urlFilter: e.currentTarget.value })}
							/>
						</label>
					)}

					<div>
						<span class={labelClass}>Resource types</span>
						<div class="mt-1 flex flex-wrap gap-2">
							{RESOURCE_TYPES.map(rt => (
								<Checkbox
									checked={
										props.rule.condition.resourceTypes?.includes(rt) ?? false
									}
									onChange={() =>
										updateCondition({
											resourceTypes: toggleArray(
												props.rule.condition.resourceTypes,
												rt,
											),
										})
									}
								>
									<span>{rt}</span>
								</Checkbox>
							))}
						</div>
					</div>

					<div>
						<span class={labelClass}>Request methods</span>
						<div class="mt-1 flex flex-wrap gap-2">
							{REQUEST_METHODS.map(rm => (
								<Checkbox
									checked={
										props.rule.condition.requestMethods?.includes(rm) ?? false
									}
									onChange={() =>
										updateCondition({
											requestMethods: toggleArray(
												props.rule.condition.requestMethods,
												rm,
											),
										})
									}
								>
									<span class="uppercase">{rm}</span>
								</Checkbox>
							))}
						</div>
					</div>

					<div class="flex flex-wrap items-end gap-4">
						<label class="flex flex-col gap-1">
							<span class={labelClass}>Initiator domains (comma-separated)</span>
							<Input
								class="min-w-[16rem]"
								placeholder="example.com, foo.com"
								value={props.rule.condition.initiatorDomains?.join(", ") ?? ""}
								onInput={e =>
									updateCondition({
										initiatorDomains: e.currentTarget.value
											.split(",")
											.map(s => s.trim())
											.filter(Boolean),
									})
								}
							/>
						</label>
						<label class="flex flex-col gap-1">
							<span class={labelClass}>Domain type</span>
							<Select
								value={props.rule.condition.domainType ?? ""}
								onChange={e =>
									updateCondition({
										domainType: (e.currentTarget.value ||
											undefined) as HeaderRule["condition"]["domainType"],
									})
								}
							>
								<option value="">any</option>
								{DOMAIN_TYPES.map(dt => (
									<option value={dt}>{dt}</option>
								))}
							</Select>
						</label>
					</div>
				</div>
			</details>
		</div>
	);
};
