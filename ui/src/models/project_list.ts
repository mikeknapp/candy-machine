import { apiRequest } from "../api";
import { State, Subscribable } from "./base";

export class ProjectList extends Subscribable {
  private state = State.Init;
  private projects: string[] = [];
  private static instance: ProjectList;

  public static getInstance(): ProjectList {
    if (!ProjectList.instance) {
      ProjectList.instance = new ProjectList();
      ProjectList.instance.load();
    }
    return ProjectList.instance;
  }

  public get hasValues() {
    return this.state === State.Loaded && this.projects.length > 0;
  }

  public get getState(): State {
    return this.state;
  }

  public get allProjects(): string[] {
    return this.projects;
  }

  async addProject(project: string) {
    this.projects.push(project);
    this.notifyListeners();
  }

  async load(refresh = false): Promise<string[]> {
    if (this.state === State.Init || refresh) {
      this.state = State.Loading;
      const response = await apiRequest<string[]>("/projects/list");
      if (response.errors) {
        console.log(`Error fetching projects: ${response.errors}`);
        this.state = State.Error;
      } else if (response.data) {
        this.projects = response.data;
        this.state = State.Loaded;
      }
      this.notifyListeners();
    }
    return this.projects;
  }
}
