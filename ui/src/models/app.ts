import { apiRequest } from "../api";
import { State, Subscribable } from "./base";
import { DEFAULT_PROJECT_DATA, Project, ProjectData } from "./project";

export interface AppData {
  state: State;
  isLoading: boolean;
  project: ProjectData;
  projects: string[];
  showCreateProjectModal: boolean;
  disableKeyboardShortcuts: boolean;
}

export const DEFAULT_APP_DATA: AppData = {
  state: State.Init,
  isLoading: true,
  project: DEFAULT_PROJECT_DATA,
  projects: [],
  showCreateProjectModal: false,
  disableKeyboardShortcuts: false,
};

export class App extends Subscribable<AppData> {
  private _project: Project;
  private _projects: string[] = [];
  private _showCreateProjectModal = false;
  private _disableKeyboardShortcuts = false;

  private constructor() {
    super();
    this._project = new Project(() => this.notifyListeners());
  }

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
      isLoading: [State.Init, State.Loading].includes(this.state),
      project: this._project.readOnly,
      projects: this._projects,
      showCreateProjectModal: this.showCreateProjectModal,
      disableKeyboardShortcuts: this.disableKeyboardShortcuts,
    };
  }

  public get project() {
    return this._project;
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

  public get showCreateProjectModal(): boolean {
    return this._showCreateProjectModal;
  }

  public set showCreateProjectModal(show: boolean) {
    this._showCreateProjectModal = show;
    this.notifyListeners();
  }

  public get disableKeyboardShortcuts(): boolean {
    return this._disableKeyboardShortcuts;
  }

  public set disableKeyboardShortcuts(disable: boolean) {
    this._disableKeyboardShortcuts = disable;
    this.notifyListeners();
  }
}