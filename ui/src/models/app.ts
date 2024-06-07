import { apiRequest } from "../api";
import { ShortcutInfo } from "../hooks/useShortcut";
import {
  ERROR_STATES,
  LOADING_STATES,
  State,
  Subscribable,
  SubscribableType,
} from "./base";
import { DEFAULT_PROJECT_DATA, Project, ProjectData } from "./project";

export interface AppData extends SubscribableType {
  project: ProjectData;
  projects: string[];
  showCreateProjectModal: boolean;
  disableKeyboardShortcuts: boolean;
}

export const DEFAULT_APP_DATA: AppData = {
  state: State.Init,
  isLoading: true,
  isError: false,
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
  private _shortcuts: ShortcutInfo[] = [];

  private constructor() {
    super();
    this._project = new Project(this);
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
      state: this._state,
      isLoading: this.isLoading,
      isError: this.isError,
      project: this._project.readOnly,
      projects: this._projects,
      showCreateProjectModal: this.showCreateProjectModal,
      disableKeyboardShortcuts: this.disableKeyboardShortcuts,
    };
  }

  public get isLoading() {
    return LOADING_STATES.has(this._state);
  }

  public get isError() {
    return ERROR_STATES.has(this._state);
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

  public get shortcuts() {
    return this._shortcuts;
  }

  public registerShortcut(shortcut: ShortcutInfo) {
    this._shortcuts.push(shortcut);
  }

  public hasShortcut(description: string): boolean {
    return this._shortcuts.some((s) => s.description === description);
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
        console.log(`Error fetching projects`, response.errors);
        this.setStateAndNotify(State.ErrorLoading);
      } else if (response.data) {
        this._projects = response.data;
        await this.loadBestProject();
        this.setStateAndNotify(State.Loaded);
      }
    }
    return this._projects;
  }

  async loadBestProject() {
    if (this._projects.length) {
      // Find the first project that doesn't start with a .
      const projectName = this._projects.find((p) => !p.startsWith("."));
      if (projectName) {
        await this.project.loadProject(projectName);
      }
    }
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
