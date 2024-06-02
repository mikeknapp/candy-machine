export enum State {
  Init = "init",
  Loading = "loading",
  Loaded = "loaded",
  Error = "error",
}

export class Subscribable {
  private listeners: (() => void)[] = [];

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
  }

  public unsubscribe(listener: () => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public notifyListeners() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
