import { PixelCrop } from "react-image-crop";
import { ApiResponse, apiRequest, eventRequest } from "../api";
import { CategoryData } from "../components/tagger/TagCategory";
import { State } from "./base";
import { Image, LoadableImage, SelectedImage, findMatchingTags } from "./image";

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

  // TODO: use the same internal naming convention as App.
  // i.e. _requiresSetup, and use getter and setters.
  public setRequiresSetup(value: boolean) {
    this.requiresSetup = value;
    this.onChange();
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
    await this.save();
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
        body: JSON.stringify(this.readOnly),
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

    // Update the image in the list.
    const newFilename = response.data.newFilename;
    const oldIndex = this.images.indexOf(oldFilename);
    if (oldIndex !== -1) {
      this.images[oldIndex] = newFilename;
    }

    // Update the selected image.
    await this.setSelectedImage(newFilename);
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
