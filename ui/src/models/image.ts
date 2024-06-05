import { apiRequest } from "../api";
import { CategoryData } from "../components/tagger/TagCategory";
import { State } from "./base";
import { Project } from "./project";

export interface SelectedImage {
  isLoaded: boolean;
  isError: boolean;
  projectName: string;
  filename: string;
  tags: string[];
  uncategorizedTags: string[];
  autoTags: string[];
  txtFile: string;
}

export class Image {
  private _state: State;
  private _project: Project;
  private _filename: string;
  private _tags: string[] = [];
  private _txtFileCache: string = null;
  private _uncategorizedCache: string[] = null;
  private _autoTags: string[] = [];

  constructor(
    project: Project,
    filename: string,
    tags: string[],
    autoTags: string[],
    state = State.Loaded,
  ) {
    this._project = project;
    this._filename = filename;
    this._tags = tags;
    this._autoTags = autoTags;
    this._state = state;
    if (this.isLoading) {
      this.load();
    }
  }

  public onChange() {
    this._project.onChange();
  }

  public invalidateCaches() {
    this._txtFileCache = null;
    this._uncategorizedCache = null;
  }

  public get readOnly(): SelectedImage {
    return {
      isLoaded: this.isLoaded,
      isError: this.isError,
      projectName: this._project.name,
      filename: this.filename,
      tags: this.tags,
      uncategorizedTags: this.uncategorizedTags,
      autoTags: this.autoTags,
      txtFile: this.txtFile,
    };
  }

  public get isLoading(): boolean {
    return this._state === State.Loading;
  }

  public get isLoaded(): boolean {
    return this._state === State.Loaded;
  }

  public get isError(): boolean {
    return this._state === State.Error;
  }

  public get filename(): string {
    return this._filename;
  }

  public get tags(): string[] {
    return this._tags;
  }

  public setTags(newTags: string[]) {
    // Remove any empty tags.
    newTags = newTags.filter((tag) => tag.trim().length > 0);
    this._tags = newTags;
    this.invalidateCaches();
  }

  public get validTags(): string[] {
    return this._project
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
    if (this._project.triggerWord) {
      result.push(this._project.triggerWord);
    }
    if (this.tags?.length > 0) {
      this._project.tagLayout.map((category) => {
        category.tags.forEach((tagTemplate) => {
          findMatchingTags(tagTemplate, this.tags).forEach((matchingTag) =>
            result.push(matchingTag),
          );
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
    }>(`/project/${this._project.name}/tags/load?image=${this._filename}`, {
      method: "GET",
    });
    if (!response.success) {
      this._state = State.Error;
      console.error("Failed to load image:", response.errors);
    } else {
      this._state = State.Loaded;
      this._autoTags = response.data.autoTags;
      this._tags = response.data.tags;
    }
    this.onChange();
  }

  public async removeTag(oldTag: string) {
    this.setTags(this.tags.filter((value) => value !== oldTag));
    this.onChange();
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
    this.onChange();
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
    this.onChange();
    return await this.saveTags();
  }

  public async saveTags() {
    const response = await apiRequest<{ result: string }>(
      `/project/${this._project.name}/tags/save`,
      {
        body: JSON.stringify({
          filename: this._filename,
          txtFile: this.txtFile,
        }),
      },
    );
    if (response.success && response.data) {
      return response.data.result === "OK";
    }
  }
}

export const imgSize = (
  filename: string,
): { width: number; height: number } => {
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

export const findMatchingTags = (tagTemplate: string, candidates: string[]) => {
  // Return an candidate tags that match a tag template.
  // A tag template might look like "flower" (exact match) or "{type} flower" (prefix broad match).
  let results: string[] = [];
  const broadMatch = tagTemplate.match(/^({[^}]+})([^{]+)$/);
  if (broadMatch) {
    const suffix = broadMatch[2];
    candidates.forEach((tag) => {
      if (tag.endsWith(suffix)) {
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
