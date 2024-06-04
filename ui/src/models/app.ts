import { apiRequest } from "../api";
import { State, Subscribable } from "./base";

export interface AppData {
  state: State;
  isLoading: boolean;
  projects: string[];
  disableKeyboardShortcuts: boolean;
}

export const DEFAULT_APP_DATA: AppData = {
  projects: [],
  state: State.Init,
  isLoading: true,
  disableKeyboardShortcuts: false,
};

export class App extends Subscribable<AppData> {
  private _projects: string[] = [];
  private _disableKeyboardShortcuts = false;

  private static instance: App;

  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  public get readOnly(): AppData {
    return {
      state: this.state,
      projects: this._projects,
      isLoading: [State.Init, State.Loading].includes(this.state),
      disableKeyboardShortcuts: this.disableKeyboardShortcuts,
    };
  }

  public get projects() {
    return this._projects;
  }

  public get hasProjects() {
    return this._projects.length > 0;
  }

  async addProject(project: string) {
    this._projects = [project, ...this._projects];
    this.notifyListeners();
  }

  async load(refresh = false): Promise<string[]> {
    if (this.state === State.Init || refresh) {
      this.setStateAndNotify(State.Loading);
      const response = await apiRequest<string[]>("/projects/list");
      if (response.errors) {
        console.log(`Error fetching projects: ${response.errors}`);
        this.setStateAndNotify(State.Error);
      } else if (response.data) {
        this._projects = response.data;
        this.setStateAndNotify(State.Loaded);
      }
    }
    return this._projects;
  }

  public get disableKeyboardShortcuts(): boolean {
    return this._disableKeyboardShortcuts;
  }

  public set disableKeyboardShortcuts(disable: boolean) {
    this._disableKeyboardShortcuts = disable;
    this.notifyListeners();
  }
}
