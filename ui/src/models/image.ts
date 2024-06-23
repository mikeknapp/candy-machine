import { apiRequest } from "../api";
import { CategoryData } from "../components/tagger/TagCategory";
import { State, SubscribableChild, SubscribableType } from "./base";
import { Project } from "./project";

export interface SIZE {
  width: number;
  height: number;
}

export interface SelectedImage extends SubscribableType {
  projectName: string;
  filename: string;
  tags: string[];
  uncategorizedTags: string[];
  autoTags: string[];
  txtFile: string;
}

export class Image extends SubscribableChild {
  private _filename: string;
  private _tags: string[] = [];
  private _txtFileCache: string | null = null;
  private _uncategorizedCache: string[] | null = null;
  private _autoTags: string[] = [];

  constructor(
    parent: Project,
    filename: string,
    tags: string[],
    autoTags: string[],
    state = State.Loaded,
  ) {
    super(parent);
    this._filename = filename;
    this._tags = tags;
    this._autoTags = autoTags;
    this._state = state;
    if (this.isLoading) {
      setTimeout(() => this.load(), 0);
    }
  }

  public get project(): Project {
    return this._parent as Project;
  }

  public invalidateCaches() {
    this._txtFileCache = null;
    this._uncategorizedCache = null;
  }

  public get readOnly(): SelectedImage {
    return {
      state: this.state,
      isLoading: this.isLoading,
      isError: this.isError,
      projectName: this.project.name,
      filename: this.filename,
      tags: this.tags,
      uncategorizedTags: this.uncategorizedTags,
      autoTags: this.autoTags,
      txtFile: this.txtFile,
    };
  }

  public get state(): State {
    return this._state;
  }

  public setStateAndNotify(newState: State) {
    if (this._state !== newState) {
      this._state = newState;
      this.notifyListeners();
    }
  }

  public get filename(): string {
    return this._filename;
  }

  public get tags(): string[] {
    return this._tags;
  }

  public setTags(newTags: string[]) {
    this._tags = newTags.filter((tag) => tag.trim().length > 0);
    this.project.markImageAsComplete(this.filename, this._tags.length > 0);
    this.invalidateCaches();
  }

  public get validTags(): string[] {
    return this.project
      .allLayoutTags()
      .flatMap((t) => findMatchingTags(t, this.tags));
  }

  public get uncategorizedTags(): string[] {
    if (!this._uncategorizedCache && this.tags.length) {
      this._uncategorizedCache = this.tags.filter(
        (tag) => !this.validTags.flat().includes(tag),
      );
    }
    return this._uncategorizedCache || [];
  }

  public get autoTags(): string[] {
    return this._autoTags;
  }

  public get txtFile(): string {
    if (this._txtFileCache !== null || !this.tags.length) {
      return this._txtFileCache || "";
    }
    const result: string[] = [];
    if (this.project.triggerWord) {
      result.push(this.project.triggerWord);
    }
    if (this.tags?.length > 0) {
      this.project.tagLayout.map((category) => {
        let categoryTags = new Set<string>();
        category.tags.forEach((tagTemplate) => {
          findMatchingTags(tagTemplate, this.tags).forEach((matchingTag) =>
            categoryTags.add(matchingTag),
          );
        });
        categoryTags.forEach((tag) => {
          result.push(tag);
        });
      });
    }
    // Add any remaining tags at the end.
    this.tags
      .filter((tag) => !result.includes(tag))
      .forEach((tag) => result.push(tag));

    this._txtFileCache = result.join(", ");
    return this._txtFileCache;
  }

  private async load(): Promise<void> {
    const response = await apiRequest<{
      autoTags: string[];
      tags: string[];
    }>(`/project/${this.project.name}/tags/load?image=${this._filename}`, {
      method: "GET",
    });
    if (!response.success || !response.data) {
      this._state = State.ErrorLoading;
      console.error("Failed to load image:", response.errors);
    } else {
      this._state = State.Loaded;
      this._autoTags = response.data.autoTags;
      this._tags = response.data.tags;
    }
    this.notifyListeners();
  }

  public async removeTag(oldTag: string) {
    this.setTags(this.tags.filter((value) => value !== oldTag));
    this.notifyListeners();
    await this.saveTags();
  }

  public async addTag(newTag: string) {
    if (newTag.includes("{")) {
      // Don't allow adding tags with {placeholders}.
      return;
    }
    await this.addTags([newTag]);
  }

  public async addTags(newTags: string[]) {
    this.setTags(Array.from(new Set([...this.tags, ...newTags])));
    this.notifyListeners();
    await this.saveTags();
  }

  public async toggleTag(tag: string) {
    if (this.tags.includes(tag)) {
      await this.removeTag(tag);
    } else {
      await this.addTag(tag);
    }
  }

  public async applyAutoTags(tagLayout: CategoryData[]) {
    // Loop through our pre-defined tag categories, and find matches with any auto tags.
    let newTags = new Set<string>();
    tagLayout.forEach((category) => {
      category.tags.forEach((tagTemplate) => {
        // Look for broad and exact matches.
        findMatchingTags(tagTemplate, this._autoTags).forEach((tag) => {
          newTags.add(tag);
        });
      });
    });

    if (newTags.size) {
      await this.addTags(Array.from(newTags));
    }
  }

  public async clearTags() {
    this.setTags([]);
    this.notifyListeners();
    return await this.saveTags();
  }

  public async saveTags(): Promise<boolean> {
    const response = await apiRequest<{ result: string }>(
      `/project/${this.project.name}/tags/save`,
      {
        body: JSON.stringify({
          filename: this._filename,
          txtFile: this.txtFile,
        }),
      },
    );
    if (response.success && response.data) {
      if (this._state !== State.Loaded) {
        this._state = State.Loaded;
        this.notifyListeners();
      }
      return response.data.result === "OK";
    } else {
      console.error("Failed to save tags:", response.errors);
      this._state = State.ErrorSaving;
      this.notifyListeners();
      return false;
    }
  }
}

export const imgSize = (filename: string): SIZE => {
  // Extract the height and width from the image ID i.e. f4227273f1f071f_589x753_0.png
  if (!filename) {
    return { width: 0, height: 0 };
  }
  const matches = filename.match(/_(\d+)x(\d+)_/);
  if (!matches) {
    return { width: 0, height: 0 };
  }
  const width = parseInt(matches[1]);
  const height = parseInt(matches[2]);
  return { width, height };
};

export const imgAspectRatio = (filename: string) => {
  const { width, height } = imgSize(filename);
  if (!width || !height) {
    return undefined;
  }
  return width / height;
};

export const resizeImage = ({
  size,
  maxHeight,
  maxWidth,
}: {
  size: SIZE;
  maxHeight?: number;
  maxWidth?: number;
}): SIZE => {
  let s = { ...size };
  if (s.width === 0 || s.height === 0) {
    return s;
  }

  // If no max size is specified, don't resize.
  if (!maxWidth && !maxHeight) {
    return s;
  }

  // If the image is already smaller than the max size, don't resize.
  if (
    maxWidth &&
    s.width <= maxWidth &&
    (!maxHeight || s.height <= maxHeight)
  ) {
    return s;
  }

  // Resize the image.
  let ratio = 1;
  if (maxWidth && maxHeight) {
    ratio = Math.min(maxWidth / s.width, maxHeight / s.height);
  } else if (maxHeight) {
    ratio = maxHeight / s.height;
  } else if (maxWidth) {
    ratio = maxWidth / s.width;
  }

  s.width = Math.round(s.width * ratio);
  s.height = Math.round(s.height * ratio);

  return s;
};

export const findMatchingTags = (tagTemplate: string, candidates: string[]) => {
  // Return an candidate tags that match a tag template.
  // A tag template might look like "flower" (exact match) or "{type} flower" (prefix broad match).
  let results: string[] = [];
  const broadMatch = tagTemplate.match(/^({[^}]+})([^{]+)$/);
  if (broadMatch) {
    const suffix = broadMatch[2];
    candidates.forEach((tag) => {
      if (tag.endsWith(suffix) && !tag.includes("{") && !tag.includes("}")) {
        results.push(tag);
      }
    });
  } else {
    // Exact match. There can only be 1 winner.
    let winner = candidates.find((value) => value === tagTemplate);
    if (winner) {
      results.push(winner);
    }
  }
  return results;
};
