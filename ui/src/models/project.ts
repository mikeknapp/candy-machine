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
  triggerSynonyms: string[];
  images: string[];
  selectedImage: SelectedImage;
  autoTags: AutoTag[];
  tagLayout: CategoryData[];
  requiresSetup: boolean;
}

export const DEFAULT_PROJECT_DATA: ProjectData = {
  name: "",
  triggerWord: "",
  triggerSynonyms: [],
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
  private _triggerSynonyms: string[] = [];
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
      name: this.name,
      triggerWord: this.triggerWord,
      triggerSynonyms: this.triggerSynonyms,
      images: this.images,
      selectedImage: this.selectedImage?.readOnly ?? null,
      tagLayout: this.tagLayout,
      autoTags: this.autoTags,
      requiresSetup: this.requiresSetup,
    };
  }

  public get state(): State {
    return this._state;
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

  public setTriggerWord(value: string) {
    this._triggerWord = value;
    this.selectedImage?.invalidateCaches();
    this.onChange();
    this.save();
  }

  public get triggerSynonyms(): string[] {
    return this._triggerSynonyms;
  }

  public setTriggerSynonyms(value: string[]) {
    this._triggerSynonyms = value;
    this.onChange();
    this.save();
  }

  public toggleTriggerSynonym(tag: string) {
    if (this._triggerSynonyms.includes(tag)) {
      this.setTriggerSynonyms(this._triggerSynonyms.filter((t) => t !== tag));
    } else {
      this.setTriggerSynonyms([...this._triggerSynonyms, tag]);
    }
  }

  public get images(): string[] {
    return this._images;
  }

  public get selectedImage(): Image {
    return this._selectedImage;
  }

  public get tagLayout(): CategoryData[] {
    return this._tagLayout;
  }

  public setTagLayout(value: CategoryData[]) {
    this._tagLayout = value;
    this.selectedImage?.invalidateCaches();
    this.onChange();
    this.save();
  }

  public allLayoutTags(includeTrigger = true): string[] {
    let allTags = this.tagLayout.reduce(
      (prev, cat) => [...prev, ...cat.tags],
      [],
    );
    if (includeTrigger && this.triggerWord) {
      allTags.push(this.triggerWord);
    }
    return allTags;
  }

  public addTagToSelectedImage(category: string, tag: string) {
    tag = tag.trim();
    if (!this.selectedImage || !category || !tag) {
      return;
    }
    if (!this.allLayoutTags(false).includes(tag)) {
      // This is a new tag that isn't in the layout. Add it.
      this.moveTagtoLayoutCategory(category, tag);
    }
    this.selectedImage?.addTag(tag);
  }

  public get autoTags(): AutoTag[] {
    return this._autoTags;
  }

  public get requiresSetup(): boolean {
    return this._requiresSetup;
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
      this._triggerSynonyms = response.data.triggerSynonyms;
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

  public async moveTagtoLayoutCategory(category: string, tag: string) {
    // Also removes the tag from any other categories. The category must exist.
    this.setTagLayout(
      this.tagLayout.map((cat) => {
        if (cat.title === category) {
          cat.tags = [...cat.tags, tag];
        } else {
          cat.tags = cat.tags.filter((t) => t !== tag);
        }
        return cat;
      }),
    );
  }

  public async removeTagFromLayout(tag: string) {
    this.setTagLayout(
      this.tagLayout.map((cat) => {
        cat.tags = cat.tags.filter((t) => t !== tag);
        return cat;
      }),
    );
  }
}
