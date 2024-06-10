import _, { get } from "lodash";
import {
  ExtractProperties,
  Path,
  getNestedValue,
  setNestedValue,
} from "../hooks/types";

export interface SubscribableType {
  state: State;
  isLoading: boolean;
  isError: boolean;
}

export enum State {
  Init = "init",
  Loading = "loading",
  Loaded = "loaded",
  ErrorLoading = "errorLoading",
  ErrorSaving = "errorSaving",
}

export const LOADING_STATES = new Set([State.Init, State.Loading]);

export const LOADED_STATES = new Set([State.Loaded]);

export const ERROR_STATES = new Set([State.ErrorLoading, State.ErrorSaving]);

export abstract class Subscribable<T extends SubscribableType> {
  protected _state: State = State.Init;

  private _listeners: Map<string, Listener<any>> = new Map();

  public abstract get readOnly(): T;

  public get state(): State {
    return this._state;
  }

  public setStateAndNotify(newState: State) {
    if (this._state !== newState) {
      this._state = newState;
      this.notifyListeners();
    }
  }

  public get hasLoaded(): boolean {
    return LOADED_STATES.has(this._state);
  }

  public get isLoading(): boolean {
    return LOADING_STATES.has(this._state);
  }

  public get isError(): boolean {
    return ERROR_STATES.has(this._state);
  }

  public subscribe<T>(
    id: string,
    callback: (newValue: any) => void,
    selectors: Path<T>[],
  ) {
    this._listeners.set(
      id,
      new Listener<T>(
        callback,
        selectors,
        extractFromSelectors(selectors, this.readOnly),
      ),
    );
  }

  public unsubscribe(id: string) {
    this._listeners.delete(id);
  }

  public async notifyListeners() {
    const newValue = this.readOnly;
    for (const listener of this._listeners.values()) {
      listener.maybeNotify(newValue);
    }
  }
}

export abstract class SubscribableChild extends Subscribable<SubscribableType> {
  constructor(protected _parent: Subscribable<SubscribableType>) {
    super();
  }

  public async notifyListeners() {
    this._parent.notifyListeners();
  }
}

class Listener<T> {
  private callback: (newValue: ExtractProperties<T, Path<T>[]>) => void;
  private selectors: Path<T>[] = [];
  private lastMsg: ExtractProperties<T, Path<T>[]> | null = null;

  constructor(
    callback: (newValue: ExtractProperties<T, Path<T>[]>) => void,
    selectors: Path<T>[],
    lastMsg: ExtractProperties<T, Path<T>[]>,
  ) {
    this.callback = callback;
    this.selectors = selectors;
    this.lastMsg = lastMsg;
    this.sendData(this.lastMsg); // Echo back initial value immediately.
  }

  public maybeNotify(newValue: T) {
    if (!valuesDidChange(this.selectors, this.lastMsg, newValue)) {
      return;
    }
    const result = extractFromSelectors(this.selectors, newValue);
    this.lastMsg = result;
    this.sendData(result);
  }

  private sendData(data: ExtractProperties<T, Path<T>[]>) {
    if (data) {
      this.callback(data);
    }
  }
}

export function valuesDidChange(
  selectors: string[],
  state1: any,
  state2: any,
): boolean {
  if (!selectors || selectors.length === 0 || selectors.includes("*")) {
    return !_.isEqual(state1, state2);
  }
  return (
    selectors.find((selector) => {
      const value1 = get(state1, selector, null);
      const value2 = get(state2, selector, null);
      return !_.isEqual(value1, value2);
    }) !== undefined
  );
}

export function extractFromSelectors<T, P>(
  selectors: Path<P>[],
  data: T,
): ExtractProperties<T, Path<P>[]> {
  const init: ExtractProperties<T, Path<P>[]> = {};
  if (
    !selectors ||
    selectors.length === 0 ||
    selectors.includes("*" as Path<P>)
  ) {
    return data as ExtractProperties<T, Path<P>[]>;
  }
  return _.cloneDeep(
    selectors.reduce((acc, selector) => {
      setNestedValue(acc, selector, getNestedValue(data, selector));
      return acc;
    }, init),
  );
}
