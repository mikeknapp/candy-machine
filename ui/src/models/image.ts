import { apiRequest } from "../api";
import { CategoryData } from "../components/tagger/TagCategory";
import { State } from "./base";
import { Project } from "./project";

export interface SelectedImage {
  projectName: string;
  filename: string;
  tags: string[];
  autoTags: string[];
  txtFile: string;
  isLoaded: boolean;
}

export class Image {
  protected _state: State;
  protected _project: Project;
  protected _filename: string;
  protected _tags: string[] = [];
  protected _autoTags: string[] = [];

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

  public get readOnly(): SelectedImage {
    return {
      projectName: this._project.name,
      filename: this._filename,
      tags: this._tags,
      autoTags: this._autoTags,
      txtFile: this.txtFile(),
      isLoaded: !this.isLoading,
    };
  }

  public get isLoading(): boolean {
    return [State.Loading, State.Init].includes(this._state);
  }

  public get filename(): string {
    return this._filename;
  }

  public get tags(): string[] {
    return this._tags;
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
      this._tags = response.data.tags;
      this._autoTags = response.data.autoTags;
    }
    this.onChange();
  }

  public async addTags(tags: string[]) {
    this._tags = Array.from(new Set([...this._tags, ...tags]));
    this.onChange();
    await this.saveTags();
  }

  public async toggleTag(tag: string) {
    if (this._tags.includes(tag)) {
      this._tags = this._tags.filter((value) => value !== tag);
    } else {
      this._tags.push(tag);
    }
    this.onChange();
    await this.saveTags();
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
    this._tags = [];
    this.onChange();
    return await this.saveTags();
  }

  public txtFile(): string {
    if (!this.tags.length) {
      return null;
    }
    const tags: string[] = [];
    if (this._project.triggerWord) {
      tags.push(this._project.triggerWord);
    }
    if (this.tags?.length > 0) {
      this._project.tagLayout.map((category) => {
        category.tags.forEach((tagTemplate) => {
          findMatchingTags(tagTemplate, this.tags).forEach((matchingTag) =>
            tags.push(matchingTag),
          );
        });
      });
    }
    // Add any remaining tags at the end.
    this.tags
      .filter((tag) => !tags.includes(tag))
      .forEach((tag) => tags.push(tag));
    return tags.join(", ");
  }

  public async saveTags() {
    const response = await apiRequest<{ result: string }>(
      `/project/${this._project.name}/tags/save`,
      {
        body: JSON.stringify({
          filename: this._filename,
          txtFile: this.txtFile(),
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
