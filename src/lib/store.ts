import { storeStateSchema, type StoreState } from "./types";

const STORAGE_KEY = "modify-headers-state";

const DEFAULT_STATE: StoreState = { groups: [] };

type ChangeListener = (state: StoreState) => void;

class Store {
	private cache: StoreState = DEFAULT_STATE;
	private listeners = new Set<ChangeListener>();

	public async load(): Promise<StoreState> {
		const result = await chrome.storage.local.get(STORAGE_KEY);
		const raw = result[STORAGE_KEY] as unknown;
		this.cache = raw ? storeStateSchema.parse(raw) : DEFAULT_STATE;
		return this.cache;
	}

	public async save(state: StoreState): Promise<void> {
		this.cache = state;
		await chrome.storage.local.set({ [STORAGE_KEY]: state });
		for (const listener of this.listeners) {
			listener(state);
		}
	}

	public getState(): StoreState {
		return this.cache;
	}

	public subscribe(listener: ChangeListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
}

export const store = new Store();
