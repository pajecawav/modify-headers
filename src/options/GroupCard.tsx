import type { JSX } from "solid-js";
import { createSignal, Index } from "solid-js";
import { createRule } from "../lib/factory";
import type { HeaderGroup } from "../lib/types";
import { Button } from "../shared/components/Button";
import { Checkbox } from "../shared/components/Checkbox";
import { RuleRow } from "./RuleRow";

interface Props {
	group: HeaderGroup;
	onChange: (group: HeaderGroup) => void;
	onDelete: () => void;
}

export const GroupCard = (props: Props): JSX.Element => {
	const [expanded, setExpanded] = createSignal(true);

	const update = (patch: Partial<HeaderGroup>): void => {
		props.onChange({ ...props.group, ...patch });
	};

	const updateRule = (ruleId: string, newRule: HeaderGroup["rules"][number]): void => {
		update({
			rules: props.group.rules.map(r => (r.id === ruleId ? newRule : r)),
		});
	};

	const addRule = (): void => {
		update({ rules: [...props.group.rules, createRule()] });
	};

	const deleteRule = (ruleId: string): void => {
		update({ rules: props.group.rules.filter(r => r.id !== ruleId) });
	};

	return (
		<div class="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
			<div class="flex items-center gap-3 p-3">
				<Checkbox
					checked={props.group.enabled}
					onChange={e => update({ enabled: e.currentTarget.checked })}
					title={props.group.enabled ? "Enabled" : "Disabled"}
				/>
				<input
					class="flex-1 rounded border-2 border-transparent bg-transparent px-2 py-1 text-base font-semibold focus:border-neutral-800 focus:outline-none dark:focus:border-neutral-200"
					value={props.group.name}
					placeholder="Group name"
					onInput={e => update({ name: e.currentTarget.value })}
				/>
				<span class="text-neutral-400">
					{props.group.rules.length} rule{props.group.rules.length === 1 ? "" : "s"}
				</span>
				<Button variant="ghost" size="sm" onClick={() => setExpanded(e => !e)}>
					{expanded() ? "Collapse" : "Expand"}
				</Button>
				<Button
					variant="ghost"
					appearance="negative"
					size="sm"
					onClick={() => {
						if (confirm(`Delete group "${props.group.name}"?`)) props.onDelete();
					}}
				>
					Delete
				</Button>
			</div>

			{expanded() && (
				<div class="space-y-2 border-t border-neutral-100 p-3 dark:border-neutral-700">
					<Index each={props.group.rules}>
						{rule => (
							<RuleRow
								rule={rule()}
								onChange={newRule => updateRule(rule().id, newRule)}
								onDelete={() => deleteRule(rule().id)}
							/>
						)}
					</Index>
					<Button variant="dashed" size="md" class="w-full" onClick={addRule}>
						+ Add rule
					</Button>
				</div>
			)}
		</div>
	);
};
