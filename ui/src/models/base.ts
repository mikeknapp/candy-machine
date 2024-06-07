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

export abstract class Subscribable<SubscribableType> {
  protected _state: State = State.Init;
  private _listeners: ((newValue: SubscribableType) => void)[] = [];

  public abstract get readOnly(): SubscribableType;

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

  public subscribe(listener: (newValue: SubscribableType) => void) {
    this._listeners.push(listener);
    // Echo the latest copy of the data back immediately.
    listener(this.readOnly);
  }

  public unsubscribe(listener: (newValue: SubscribableType) => void) {
    this._listeners = this._listeners.filter((l) => l !== listener);
  }

  public async notifyListeners() {
    for (const listener of this._listeners) {
      listener(this.readOnly);
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
