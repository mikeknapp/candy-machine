import { PixelCrop } from "react-image-crop";
import { ApiResponse, apiRequest, eventRequest } from "../api";
import { CategoryData } from "../components/tagger/TagCategory";
import { State, Subscribable } from "./base";
import { Image, SelectedImageTags } from "./image";

export interface ProjectData {
  state: string;
  name: string;
  triggerWord: string;
  images: string[];
  selectedImage: string;
  autoTags: AutoTag[];
  tagLayout: CategoryData[];
  requiresSetup: boolean;
}

export interface NewProjectRequest {
  name: string;
  triggerWord: string;
  importDirPath: string;
  removeDuplicates: boolean;
}

export interface AutoTag {
  tag: string;
  count: number;
  examples: string[];
}

export class Project extends Subscribable implements ProjectData {
  public state = State.Init;
  public name: string = "";
  public triggerWord: string = "";
  public images: string[] = [];
  public _selectedImage: Image = null;
  public autoTags: AutoTag[] = [];
  public tagLayout: CategoryData[] = [];
  public requiresSetup: boolean = false;

  private static instance: Project;

  public static getInstance(): Project {
    if (!Project.instance) {
      Project.instance = new Project();
    }
    return Project.instance;
  }

  private reset(newName: string = "") {
    this.state = State.Init;
    this.name = newName;
    this.triggerWord = "";
    this.images = [];
    this._selectedImage = null;
    this.autoTags = [];
    this.tagLayout = [];
    this.requiresSetup = false;
    this.notifyListeners();
  }

  public get readOnly(): ProjectData {
    return {
      state: this.state,
      name: this.name,
      triggerWord: this.triggerWord,
      images: this.images,
      selectedImage: this.selectedImage,
      autoTags: this.autoTags,
      tagLayout: this.tagLayout,
      requiresSetup: this.requiresSetup,
    };
  }

  // TODO: Return a readOnly version of ImageData instead.
  public get selectedImage(): string {
    return this._selectedImage ? this._selectedImage.filename : "";
  }

  public async createNew(data: NewProjectRequest): Promise<boolean> {
    this.reset(data.name);
    const response = await apiRequest<{}>("/project/create", {
      body: JSON.stringify(data),
    });
    if (response.success && response.data) {
      return this.loadProject(data.name);
    }
    this.state = State.Error;
    this.notifyListeners();
    console.log(`Failed to create project: ${response.errors}`);
  }

  public async save(): Promise<boolean> {
    const response = await apiRequest<{ result: string }>(
      `/project/${this.name}/save`,
      {
        body: JSON.stringify(this),
      },
    );
    if (response.success && response.data) {
      return response.data.result === "OK";
    }
  }

  public async loadProject(projectName: string): Promise<boolean> {
    this.reset(projectName);
    this.state = State.Loading;
    const response = await apiRequest<Project>(`/project/${this.name}/get`);
    if (response.success && response.data) {
      this.triggerWord = response.data.triggerWord;
      this.images = response.data.images;
      this.autoTags = response.data.autoTags;
      this.tagLayout = response.data.tagLayout;
      this.requiresSetup = response.data.requiresSetup;
      this.state = State.Loaded;
      this.notifyListeners();
      return true;
    }
    this.state = State.Error;
    this.notifyListeners();
    console.log(`Failed to load project '${this.name}': ${response.errors}`);
  }

  public async importImages(
    importPath: string,
    removeDuplicates: boolean,
    onMessage: (msg: string) => void,
  ): Promise<boolean> {
    return await eventRequest(
      `/project/${this.name}/import?path=${encodeURIComponent(importPath)}&remove_duplicates=${removeDuplicates}`,
      onMessage,
    );
  }

  public navigateImages(direction: "next" | "prev"): string {
    // Returns the name of the next or previous image in the list.
    const currentIndex = this.images.indexOf(this._selectedImage.filename);
    if (currentIndex === -1) {
      return;
    }
    switch (direction) {
      case "next":
        const nextIndex = currentIndex + 1;
        if (nextIndex < this.images.length) {
          return this.images[nextIndex];
        }
        break;
      case "prev":
        const previousIndex = currentIndex - 1;
        if (previousIndex >= 0) {
          return this.images[previousIndex];
        }
        break;
    }
  }

  public async deleteImage(filename: string): Promise<boolean> {
    const response = await apiRequest(`/project/${this.name}/img/delete`, {
      body: JSON.stringify({
        filename: filename,
      }),
    });
    if (!response.success) {
      throw new Error(`Failed to delete image: ${response.errors}`);
    }
    // Remove the image from the list.
    const index = this.images.indexOf(filename);
    if (index !== -1) {
      this.images.splice(index, 1);
      this.notifyListeners();
    }
    return true;
  }

  public async editImage(
    oldFilename: string,
    rotate: number,
    flip: boolean,
    crop: PixelCrop,
  ): Promise<boolean> {
    const response = await apiRequest<{ newFilename: string }>(
      `/project/${this.name}/img/edit`,
      {
        body: JSON.stringify({
          filename: oldFilename,
          rotate: rotate,
          flip: flip,
          crop: crop,
        }),
      },
    );
    if (!response.success) {
      throw new Error(`Failed to edit image: ${response.errors}`);
    }
    const newFilename = response.data.newFilename;
    // Update the image in the list.
    const oldIndex = this.images.indexOf(oldFilename);
    if (oldIndex !== -1) {
      this.images[oldIndex] = newFilename;
    }

    // If this image was selected, update the selected image.
    if (this._selectedImage && this._selectedImage.filename === oldFilename) {
      this._selectedImage = await Image.load(newFilename);
    }

    this.notifyListeners();
    return true;
  }
}

export interface NewProject {
  name: string;
  triggerWord: string;
  importDirPath: string;
  removeDuplicates: boolean;
}

export interface Project_old {
  name: string;
  triggerWord: string;
  isSelected: boolean;
  images: string[];
  selectedImage: string;
  autoTags: AutoTag[]; // From our auto-tag analysis.
  tagLayout: CategoryData[]; // The layout of the tags categories.
  requiresSetup: boolean; // We have auto-tag suggestions for the user.
  [key: string]: any; // Add index signature
}

export async function createProject(
  data: NewProject,
): Promise<ApiResponse<Project_old>> {
  const response = await apiRequest<{}>("/project/create", {
    body: JSON.stringify(data),
  });
  if (response.success && response.data) {
    return {
      success: true,
      data: {
        name: data.name,
        triggerWord: data.triggerWord,
        isSelected: false,
        images: [],
        selectedImage: "",
        autoTags: [],
        tagLayout: [],
        requiresSetup: false,
      },
    };
  } else {
    return { success: false, errors: response.errors };
  }
}

export async function listProjects(): Promise<Project_old[]> {
  const response = await apiRequest<string[]>("/projects/list");
  if (response.success && response.data) {
    return await Promise.all(
      response.data.map(async (name, i) => {
        if (i === 0) {
          const p = await loadProject(name);
          return { ...p, isSelected: true };
        }
        return {
          name: name,
          triggerWord: "",
          isSelected: false,
          images: [],
          selectedImage: "",
          autoTags: [],
          tagLayout: [],
          requiresSetup: false,
        };
      }),
    );
  } else {
    console.error(`Error fetching projects: ${response.errors}`);
  }
  return [];
}

export async function loadProject(name: string): Promise<Project_old> {
  const response = await apiRequest<Project_old>(`/project/${name}/get`);
  if (response.success && response.data) {
    return response.data;
  }
}

export async function saveProject(project: Project_old): Promise<boolean> {
  const response = await apiRequest<{ result: string }>(
    `/project/${project.name}/save`,
    {
      body: JSON.stringify(project),
    },
  );
  if (response.success && response.data) {
    return response.data.result === "OK";
  }
}

export async function saveTags(
  projectName: string,
  image: string,
  tags: string[],
): Promise<boolean> {
  const response = await apiRequest<{ result: string }>(
    `/project/${projectName}/tags/save`,
    {
      body: JSON.stringify({ image, tags }),
    },
  );
  if (response.success && response.data) {
    return response.data.result === "OK";
  }
}

export async function loadTags(
  projectName: string,
  image: string,
): Promise<SelectedImageTags> {
  const response = await apiRequest<SelectedImageTags>(
    `/project/${projectName}/tags/load?image=${image}`,
  );
  if (response.success && response.data) {
    return response.data;
  }
}

export async function importImages(
  project: Project_old,
  importPath: string,
  removeDuplicates: boolean,
  onMessage: (msg: string) => void,
): Promise<boolean> {
  return await eventRequest(
    `/project/${project.name}/import?path=${encodeURIComponent(importPath)}&remove_duplicates=${removeDuplicates}`,
    onMessage,
  );
}

export function navigateImages(
  project: Project_old,
  direction: "next" | "prev",
): string {
  // Returns the name of the next or previous image in the list.
  const currentIndex = project.images.indexOf(project.selectedImage);
  if (currentIndex === -1) {
    return;
  }
  switch (direction) {
    case "next":
      const nextIndex = currentIndex + 1;
      if (nextIndex < project.images.length) {
        return project.images[nextIndex];
      }
      break;
    case "prev":
      const previousIndex = currentIndex - 1;
      if (previousIndex >= 0) {
        return project.images[previousIndex];
      }
      break;
  }
}

export function previewTagTextFile(
  project: Project_old,
  selectedTags: string[],
): string {
  if (!selectedTags) {
    selectedTags = [];
  }
  const tags = [];
  if (project.triggerWord) {
    tags.push(project.triggerWord);
  }
  project.tagLayout.map((category) => {
    const selectedFromCat = selectedTags.filter((tag) =>
      category.tags.includes(tag),
    );
    selectedFromCat.forEach((tag) => {
      tags.push(tag);
    });
  });
  return tags.join(", ");
}
