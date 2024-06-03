import { apiRequest } from "../api";
import { State, Subscribable } from "./base";

export interface AppData {
  state: State;
  isLoading: boolean;
  projects: string[];
}

export const DEFAULT_APP_DATA: AppData = {
  projects: [],
  state: State.Init,
  isLoading: true,
};

export class App extends Subscribable<AppData> {
  private projectNames: string[] = [];
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
      projects: this.projectNames,
      isLoading: [State.Init, State.Loading].includes(this.state),
    };
  }

  public get projects() {
    return this.projectNames;
  }

  public get hasProjects() {
    return this.projectNames.length > 0;
  }

  async addProject(project: string) {
    this.projectNames = [project, ...this.projectNames];
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
        this.projectNames = response.data;
        this.setStateAndNotify(State.Loaded);
      }
    }
    return this.projectNames;
  }
}
