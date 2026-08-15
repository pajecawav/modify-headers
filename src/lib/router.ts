import { nanoid } from "nanoid";
import { initWERPC } from "werpc";
import { z } from "zod";
import { setIcon } from "../background/theme";
import { applyBadge } from "./badge";
import { applyDnr } from "./dnr";
import { store } from "./store";
import { headerGroupSchema, type HeaderGroup, type StoreState } from "./types";

const t = initWERPC();

const persist = async (state: StoreState): Promise<StoreState> => {
	await store.save(state);
	await applyDnr(state);
	applyBadge(state);
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
	return { ...state, groups };
};

export const backgroundRouter = t.router({
	list: t.procedure.query(() => store.getState()),

	upsertGroup: t.procedure
		.input(headerGroupSchema)
		.mutation(({ input }) => persist(replaceGroup(store.getState(), input))),

	deleteGroup: t.procedure.input(z.string()).mutation(({ input }) => {
		const state = store.getState();
		return persist({ ...state, groups: state.groups.filter(g => g.id !== input) });
	}),

	toggleGroup: t.procedure.input(z.string()).mutation(({ input }) => {
		const state = store.getState();
		return persist({
			...state,
			groups: state.groups.map(g => (g.id === input ? { ...g, enabled: !g.enabled } : g)),
		});
	}),

	toggleAll: t.procedure.mutation(() => {
		const state = store.getState();
		return persist({ ...state, enabled: !state.enabled });
	}),

	themeChanged: t.procedure.input(z.object({ dark: z.boolean() })).mutation(({ input }) => {
		setIcon(input.dark);
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
