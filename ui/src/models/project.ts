import { PixelCrop } from "react-image-crop";
import { ApiResponse, apiRequest, eventRequest } from "../api";
import { CategoryData } from "../components/tagger/TagCategory";
import { State } from "./base";
import {
  Image,
  LoadableImage,
  SelectedImage,
  SelectedImageTags,
  findMatchingTags,
} from "./image";

export interface ProjectData {
  state: State;
  isLoading: boolean;
  name: string;
  triggerWord: string;
  images: string[];
  selectedImage: SelectedImage;
  selectedImageTxtFile: string;
  autoTags: AutoTag[];
  tagLayout: CategoryData[];
  requiresSetup: boolean;
}

export const DEFAULT_PROJECT_DATA: ProjectData = {
  name: "",
  triggerWord: "",
  images: [],
  selectedImage: null,
  selectedImageTxtFile: "",
  tagLayout: [],
  autoTags: [],
  requiresSetup: false,
  state: State.Init,
  isLoading: true,
};

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

export class Project {
  protected onChange: () => void;
  public state = State.Init;
  public name: string = "";
  public triggerWord: string = "";
  public images: string[] = [];
  public selectedImage: Image = null;
  public autoTags: AutoTag[] = [];
  public tagLayout: CategoryData[] = [];
  public requiresSetup: boolean = false;

  constructor(onChange: () => void) {
    this.onChange = onChange;
  }

  private reset(newName: string = "") {
    this.state = State.Init;
    this.name = newName;
    this.triggerWord = "";
    this.images = [];
    this.selectedImage = null;
    this.autoTags = [];
    this.tagLayout = [];
    this.requiresSetup = false;
    this.onChange();
  }

  public get readOnly(): ProjectData {
    return {
      state: this.state,
      isLoading: [State.Loading, State.Init].includes(this.state),
      name: this.name,
      triggerWord: this.triggerWord,
      images: this.images,
      selectedImage: this.selectedImage?.readOnly ?? null,
      selectedImageTxtFile: this.selectedImageTxtFile(),
      autoTags: this.autoTags,
      tagLayout: this.tagLayout,
      requiresSetup: this.requiresSetup,
    };
  }

  public setStateAndNotify(state: State) {
    this.state = state;
    this.onChange();
  }

  public async setSelectedImage(filename: string) {
    if (!filename || this.selectedImage?.filename === filename) {
      return;
    }
    this.selectedImage = new LoadableImage(
      () => this.onChange(),
      this.name,
      filename,
    );
    this.onChange();
    this.save();
  }

  public async createProject(
    data: NewProjectRequest,
  ): Promise<ApiResponse<ProjectData>> {
    // We don't override the current project in this method. That happens later.
    const response = await apiRequest<ProjectData>("/project/create", {
      body: JSON.stringify(data),
    });
    if (response.success && response.data) {
      return { success: true, data: this.readOnly };
    } else {
      console.log(`Failed to create project: ${response.errors}`);
      return { success: false, errors: response.errors };
    }
  }

  public async save() {
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

  public async loadProject(projectName: string) {
    this.reset(projectName);
    this.state = State.Loading;
    const response = await apiRequest<ProjectData>(`/project/${this.name}/get`);
    if (response.success && response.data) {
      this.triggerWord = response.data.triggerWord;
      this.images = response.data.images;
      this.autoTags = response.data.autoTags;
      this.tagLayout = response.data.tagLayout;
      this.requiresSetup = response.data.requiresSetup;
      if (response.data.selectedImage) {
        this.selectedImage = new Image(
          () => this.onChange(),
          this.name,
          response.data.selectedImage.filename,
          response.data.selectedImage.tags,
          response.data.selectedImage.autoTags,
        );
      } else {
        this.selectedImage = null;
      }
      this.setStateAndNotify(State.Loaded);
      return true;
    }
    this.setStateAndNotify(State.Error);
    console.log(`Failed to load project '${this.name}': ${response.errors}`);
  }

  public async importImages(
    data: NewProjectRequest,
    onMessage: (msg: string) => void,
  ) {
    return await eventRequest(
      `/project/${data.name}/import?path=${encodeURIComponent(data.importDirPath)}&remove_duplicates=${data.removeDuplicates}`,
      onMessage,
    );
  }

  public navigateImages(direction: "next" | "prev"): string {
    // Returns the name of the next or previous image in the list.
    const currentIndex = this.images.indexOf(this.selectedImage?.filename);
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
    // Find the next image to select after we delete.
    const nextImage = this.navigateImages("next");
    const prevImage = this.navigateImages("prev");
    const bestImage = nextImage || prevImage;

    // Remove the image from the list.
    const index = this.images.indexOf(filename);
    if (index !== -1) {
      this.images.splice(index, 1);
    }

    // Select the best image.
    if (bestImage) {
      this.setSelectedImage(bestImage);
    } else {
      this.selectedImage = null;
      this.onChange();
    }

    // Perform the delete on the server.
    const response = await apiRequest(`/project/${this.name}/img/delete`, {
      body: JSON.stringify({
        filename: filename,
      }),
    });
    if (!response.success) {
      this.images.splice(index, 0, filename);
      this.selectedImage = new LoadableImage(
        () => this.onChange(),
        this.name,
        filename,
      );
      setTimeout(() => {
        alert(`Failed to delete image; check server logs`);
      }, 500);
      return false;
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
      alert(`Failed to edit image; check server logs`);
      return false;
    }
    const newFilename = response.data.newFilename;
    // Update the image in the list.
    const oldIndex = this.images.indexOf(oldFilename);
    if (oldIndex !== -1) {
      this.images[oldIndex] = newFilename;
    }

    // If this image was selected, update the selected image.
    if (this.selectedImage && this.selectedImage.filename === oldFilename) {
      this.setSelectedImage(newFilename);
    }
    this.onChange();
    return true;
  }

  public selectedImageTxtFile(): string {
    if (!this.selectedImage?.tags.length) {
      return null;
    }
    const tags: string[] = [];
    if (this.triggerWord) {
      tags.push(this.triggerWord);
    }
    if (this.selectedImage.tags?.length > 0) {
      this.tagLayout.map((category) => {
        category.tags.forEach((tagTemplate) => {
          findMatchingTags(tagTemplate, this.selectedImage.tags).forEach(
            (matchingTag) => tags.push(matchingTag),
          );
        });
      });
    }
    // Add any remaining tags at the end.
    this.selectedImage.tags
      .filter((tag) => !tags.includes(tag))
      .forEach((tag) => tags.push(tag));
    return tags.join(", ");
  }

  public async addTagToLayout(category: string, tag: string): Promise<boolean> {
    this.tagLayout = this.tagLayout.map((cat) => {
      if (cat.title === category) {
        cat.tags = [tag, ...cat.tags];
      }
      return cat;
    });
    this.onChange();
    return await this.save();
  }

  public async removeTagFromLayout(tag: string): Promise<boolean> {
    this.tagLayout = this.tagLayout.map((cat) => {
      cat.tags = cat.tags.filter((t) => t !== tag);
      return cat;
    });
    this.onChange();
    return await this.save();
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
  project: ProjectData,
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
