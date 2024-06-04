import { PixelCrop } from "react-image-crop";
import { ApiResponse, apiRequest, eventRequest } from "../api";
import { CategoryData } from "../components/tagger/TagCategory";
import { State } from "./base";
import { Image, SelectedImage } from "./image";

export interface ProjectData {
  state: State;
  isLoading: boolean;
  name: string;
  triggerWord: string;
  images: string[];
  selectedImage: SelectedImage;
  autoTags: AutoTag[];
  tagLayout: CategoryData[];
  requiresSetup: boolean;
}

export const DEFAULT_PROJECT_DATA: ProjectData = {
  name: "",
  triggerWord: "",
  images: [],
  selectedImage: null,
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
  private _onChange: () => void;
  private _state = State.Init;
  private _name: string = "";
  private _triggerWord: string = "";
  private _images: string[] = [];
  private _selectedImage: Image = null;
  private _autoTags: AutoTag[] = [];
  private _tagLayout: CategoryData[] = [];
  private _requiresSetup: boolean = false;

  constructor(onChange: () => void) {
    this._onChange = onChange;
  }

  public onChange() {
    this._onChange();
  }

  public setStateAndNotify(state: State) {
    this._state = state;
    this.onChange();
  }

  private reset(newName: string = "") {
    this._state = State.Init;
    this._name = newName;
    this._triggerWord = "";
    this._images = [];
    this._selectedImage = null;
    this._autoTags = [];
    this._tagLayout = [];
    this._requiresSetup = false;
    this.onChange();
  }

  public get readOnly(): ProjectData {
    return {
      state: this._state,
      isLoading: this.isLoading,
      name: this._name,
      triggerWord: this._triggerWord,
      images: this._images,
      selectedImage: this._selectedImage?.readOnly ?? null,

      tagLayout: this._tagLayout,
      autoTags: this._autoTags,
      requiresSetup: this._requiresSetup,
    };
  }

  public get isLoading(): boolean {
    return this._state === State.Loading;
  }

  public get name(): string {
    return this._name;
  }

  public get triggerWord(): string {
    return this._triggerWord;
  }

  public get autoTags(): AutoTag[] {
    return this._autoTags;
  }

  public get tagLayout(): CategoryData[] {
    return this._tagLayout;
  }

  public get selectedImage(): Image {
    return this._selectedImage;
  }

  public setRequiresSetup(value: boolean) {
    this._requiresSetup = value;
    this.onChange();
  }

  public async setSelectedImage(filename: string) {
    if (!filename || this._selectedImage?.filename === filename) {
      return;
    }
    this._selectedImage = new Image(this, filename, [], [], State.Loading);
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
      `/project/${this._name}/save`,
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
    this._state = State.Loading;
    const response = await apiRequest<ProjectData>(
      `/project/${this._name}/get`,
    );
    if (response.success && response.data) {
      this._triggerWord = response.data.triggerWord;
      this._images = response.data.images;
      this._autoTags = response.data.autoTags;
      this._tagLayout = response.data.tagLayout;
      this._requiresSetup = response.data.requiresSetup;
      if (response.data.selectedImage) {
        this._selectedImage = new Image(
          this,
          response.data.selectedImage.filename,
          response.data.selectedImage.tags,
          response.data.selectedImage.autoTags,
        );
      } else {
        this._selectedImage = null;
      }
      this.setStateAndNotify(State.Loaded);
      return true;
    }
    this.setStateAndNotify(State.Error);
    console.log(`Failed to load project '${this._name}': ${response.errors}`);
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
    // Returns the name of the next or previous image in the list. However, it does not set the selected image!
    const currentIndex = this._images.indexOf(this._selectedImage?.filename);
    if (currentIndex === -1) {
      return;
    }
    switch (direction) {
      case "next":
        const nextIndex = currentIndex + 1;
        if (nextIndex < this._images.length) {
          return this._images[nextIndex];
        }
        break;
      case "prev":
        const previousIndex = currentIndex - 1;
        if (previousIndex >= 0) {
          return this._images[previousIndex];
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
    const index = this._images.indexOf(filename);
    if (index !== -1) {
      this._images.splice(index, 1);
    }

    // Select the best image.
    if (bestImage) {
      this.setSelectedImage(bestImage);
    } else {
      this._selectedImage = null;
      this.onChange();
    }

    // Perform the delete on the server.
    const response = await apiRequest(`/project/${this._name}/img/delete`, {
      body: JSON.stringify({
        filename: filename,
      }),
    });
    if (!response.success) {
      this._images.splice(index, 0, filename);
      this._selectedImage = new Image(this, filename, [], [], State.Loading);
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
      `/project/${this._name}/img/edit`,
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
    const oldIndex = this._images.indexOf(oldFilename);
    if (oldIndex !== -1) {
      this._images[oldIndex] = newFilename;
    }

    // Update the selected image.
    await this.setSelectedImage(newFilename);
    return true;
  }

  public async addTagToLayout(category: string, tag: string): Promise<boolean> {
    this._tagLayout = this._tagLayout.map((cat) => {
      if (cat.title === category) {
        cat.tags = [tag, ...cat.tags];
      }
      return cat;
    });
    this.onChange();
    return await this.save();
  }

  public async removeTagFromLayout(tag: string): Promise<boolean> {
    this._tagLayout = this._tagLayout.map((cat) => {
      cat.tags = cat.tags.filter((t) => t !== tag);
      return cat;
    });
    this.onChange();
    return await this.save();
  }
}
