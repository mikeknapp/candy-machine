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

export abstract class Subscribable<DataType> {
  public state: State = State.Init;

  private listeners: ((newValue: DataType) => void)[] = [];

  public abstract get readOnly(): DataType;

  public setStateAndNotify(newState: State) {
    if (this.state !== newState) {
      this.state = newState;
      this.notifyListeners();
    }
  }

  public get getState(): State {
    return this.state;
  }

  public get hasLoaded(): boolean {
    return this.state === State.Loaded;
  }

  public subscribe(listener: (newValue: DataType) => void) {
    this.listeners.push(listener);
    // Echo the latest copy of the data back immediately.
    listener(this.readOnly);
  }

  public unsubscribe(listener: (newValue: DataType) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.readOnly);
    }
  }
}
