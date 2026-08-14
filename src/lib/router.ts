import { nanoid } from "nanoid";
import { initWERPC } from "werpc";
import { applyDnr } from "./dnr";
import { store } from "./store";
import type { HeaderGroup, StoreState } from "./types";

const t = initWERPC();

const persist = async (state: StoreState): Promise<StoreState> => {
	await store.save(state);
	await applyDnr(state);
	return state;
};

const replaceGroup = (state: StoreState, group: HeaderGroup): StoreState => {
	const idx = state.groups.findIndex(g => g.id === group.id);
	const groups = [...state.groups];
	if (idx === -1) {
		groups.push(group);
	} else {
		groups[idx] = group;
	}
	return { groups };
};

export const backgroundRouter = t.router({
	list: t.procedure.query(() => store.getState()),

	upsertGroup: t.procedure
		.input((value): HeaderGroup => {
			if (
				typeof value !== "object" ||
				value === null ||
				typeof (value as HeaderGroup).id !== "string" ||
				typeof (value as HeaderGroup).name !== "string" ||
				typeof (value as HeaderGroup).enabled !== "boolean" ||
				!Array.isArray((value as HeaderGroup).rules)
			) {
				throw new Error("Invalid group");
			}
			return value as HeaderGroup;
		})
		.mutation(({ input }) => persist(replaceGroup(store.getState(), input))),

	deleteGroup: t.procedure
		.input((value): string => {
			if (typeof value !== "string") {
				throw new Error("Invalid group id");
			}
			return value;
		})
		.mutation(({ input }) =>
			persist({ groups: store.getState().groups.filter(g => g.id !== input) }),
		),

	toggleGroup: t.procedure
		.input((value): string => {
			if (typeof value !== "string") {
				throw new Error("Invalid group id");
			}
			return value;
		})
		.mutation(({ input }) => {
			const state = store.getState();
			return persist({
				groups: state.groups.map(g => (g.id === input ? { ...g, enabled: !g.enabled } : g)),
			});
		}),

	changed: t.procedure.subscription(async function* ({ signal }) {
		yield store.getState();
		const queue: StoreState[] = [];
		let resolveNext: (() => void) | undefined;

		const unsubscribe = store.subscribe(state => {
			queue.push(state);
			resolveNext?.();
		});

		const onAbort = () => {
			unsubscribe();
			resolveNext?.();
		};
		signal?.addEventListener("abort", onAbort, { once: true });

		try {
			while (!signal?.aborted) {
				if (queue.length === 0) {
					await new Promise<void>(resolve => {
						resolveNext = resolve;
					});
					resolveNext = undefined;
				}
				while (queue.length > 0 && !signal?.aborted) {
					yield queue.shift()!;
				}
			}
		} finally {
			unsubscribe();
		}
	}),
});

export type BackgroundRouter = typeof backgroundRouter;

export { nanoid };
