import type { JSX } from "solid-js";
import { createSignal, Index, onMount, Show } from "solid-js";
import { createClient } from "werpc";
import { createGroup } from "../lib/factory";
import type { HeaderGroup } from "../lib/types";
import { GroupCard } from "./GroupCard";

const client = createClient({ clientName: "options" });

const DEBOUNCE_MS = 400;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export const App = (): JSX.Element => {
	const [groups, setGroups] = createSignal<HeaderGroup[]>([]);
	const [loading, setLoading] = createSignal(true);

	onMount(async () => {
		const state = await client.background.list.query();
		setGroups(state.groups);
		setLoading(false);
	});

	const persistGroup = (group: HeaderGroup): void => {
		clearTimeout(timers.get(group.id));
		timers.set(
			group.id,
			setTimeout(() => {
				void client.background.upsertGroup.mutate(group);
				timers.delete(group.id);
			}, DEBOUNCE_MS),
		);
	};

	const handleGroupChange = (group: HeaderGroup): void => {
		setGroups(gs => {
			const idx = gs.findIndex(g => g.id === group.id);
			if (idx === -1) return [...gs, group];
			const next = [...gs];
			next[idx] = group;
			return next;
		});
		persistGroup(group);
	};

	const handleAddGroup = (): void => {
		const group = createGroup();
		setGroups(gs => [...gs, group]);
		void client.background.upsertGroup.mutate(group);
	};

	const handleDeleteGroup = (id: string): void => {
		setGroups(gs => gs.filter(g => g.id !== id));
		void client.background.deleteGroup.mutate(id);
	};

	return (
		<div class="mx-auto max-w-4xl p-6">
			<header class="mb-6 flex items-center justify-between">
				<h1 class="text-2xl font-bold">Modify Headers</h1>
				<button
					type="button"
					class="cursor-pointer rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-300"
					onClick={handleAddGroup}
				>
					Add group
				</button>
			</header>

			<Show when={!loading()} fallback={<p class="text-neutral-500">Loading…</p>}>
				<Show
					when={groups().length > 0}
					fallback={
						<p class="text-center text-neutral-500">
							No groups yet. Click "Add group" to create one.
						</p>
					}
				>
					<div class="space-y-3">
						<Index each={groups()}>
							{group => (
								<GroupCard
									group={group()}
									onChange={handleGroupChange}
									onDelete={() => handleDeleteGroup(group().id)}
								/>
							)}
						</Index>
					</div>
				</Show>
			</Show>
		</div>
	);
};
