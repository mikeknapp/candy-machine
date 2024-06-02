import { apiRequest } from "../api";
import { State, Subscribable } from "./base";

export interface AllProjectData {
  state: State;
  projects: string[];
}

export class AllProjects extends Subscribable<AllProjectData> {
  private _projects: string[] = [];
  private static instance: AllProjects;

  public static getInstance(): AllProjects {
    if (!AllProjects.instance) {
      AllProjects.instance = new AllProjects();
    }
    return AllProjects.instance;
  }

  public get readOnly(): AllProjectData {
    return {
      state: this.state,
      projects: this._projects,
    };
  }

  public get projects() {
    return this._projects;
  }

  public get hasProjects() {
    return this._projects.length > 0;
  }

  async addProject(project: string) {
    this._projects.push(project);
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
}
