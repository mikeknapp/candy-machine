export enum State {
  Init = "init",
  Loading = "loading",
  Loaded = "loaded",
  Error = "error",
}

export abstract class Subscribable<DataType> {
  private listeners: ((newValue: DataType) => void)[] = [];

  public abstract get readOnly(): DataType;

  public subscribe(listener: (newValue: DataType) => void) {
    this.listeners.push(listener);
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
