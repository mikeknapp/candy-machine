import { PixelCrop } from "react-image-crop";
import { apiRequest } from "../api";
import { CategoryData } from "../components/tagger/TagCategory";
import { State } from "./base";
import { Project_old } from "./project";

export interface SelectedImageTags {
  projectName: string;
  image: string;
  selected: string[];
  autoTags: string[];
}

export interface SelectedImage {
  projectName: string;
  filename: string;
  tags: string[];
  autoTags: string[];
  isLoaded: boolean;
}

export class Image {
  protected onChange: () => void;
  protected state: State;
  public projectName: string;
  public filename: string;
  public tags: string[] = [];
  public autoTags: string[] = [];

  constructor(
    onChange: () => void,
    projectName: string,
    filename: string,
    tags: string[],
    autoTags: string[],
    state = State.Loaded,
  ) {
    this.onChange = onChange;
    this.projectName = projectName;
    this.filename = filename;
    this.tags = tags;
    this.autoTags = autoTags;
    this.state = state;
  }

  public get readOnly(): SelectedImage {
    return {
      projectName: this.projectName,
      filename: this.filename,
      tags: this.tags,
      autoTags: this.autoTags,
      isLoaded: this.state === State.Loaded,
    };
  }

  public async addTags(tags: string[]) {
    this.tags = Array.from(new Set([...this.tags, ...tags]));
    this.onChange();
    await this.saveTags();
  }

  public async toggleTag(tag: string) {
    if (this.tags.includes(tag)) {
      this.tags = this.tags.filter((value) => value !== tag);
    } else {
      this.tags.push(tag);
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
        findMatchingTags(tagTemplate, this.autoTags).forEach((tag) => {
          newTags.add(tag);
        });
      });
    });

    if (newTags.size) {
      await this.addTags(Array.from(newTags));
    }
  }

  public async clearTags() {
    this.tags = [];
    this.onChange();
    return await this.saveTags();
  }

  public async saveTags() {
    // TODO: Reorder tags correctly (or maybe we do that on the server?)
    const response = await apiRequest<{ result: string }>(
      `/project/${this.projectName}/tags/save`,
      {
        body: JSON.stringify({ filename: this.filename, tags: this.tags }),
      },
    );
    if (response.success && response.data) {
      return response.data.result === "OK";
    }
  }
}

export class LoadableImage extends Image {
  constructor(onChange: () => void, projectName: string, filename: string) {
    super(onChange, projectName, filename, [], [], State.Loading);
    // Load the image asynchonously so that the UI isn't blocked by the constructor.
    new Promise(() => {
      setTimeout(() => this.load(), 0);
    });
  }

  private async load(): Promise<void> {
    const response = await apiRequest<{
      autoTags: string[];
      tags: string[];
    }>(`/project/${this.projectName}/tags/load?image=${this.filename}`, {
      method: "GET",
    });
    if (!response.success) {
      this.state = State.Error;
      console.error("Failed to load image:", response.errors);
    } else {
      this.state = State.Loaded;
      this.tags = response.data.tags;
      this.autoTags = response.data.autoTags;
    }
    this.onChange();
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

export const deleteImage = async (
  project: Project_old,
  filename: string,
): Promise<boolean> => {
  const response = await apiRequest(`/project/${project.name}/img/delete`, {
    body: JSON.stringify({
      filename: filename,
    }),
  });
  if (!response.success) {
    console.error("Error deleting image:", response.errors);
    return false;
  }
  return true;
};

export const editImage = async (
  project: Project_old,
  filename: string,
  rotate: number,
  flip: boolean,
  crop: PixelCrop,
): Promise<string> => {
  const response = await apiRequest<{ newFilename: string }>(
    `/project/${project.name}/img/edit`,
    {
      body: JSON.stringify({
        filename: filename,
        rotate: rotate,
        flip: flip,
        crop: crop,
      }),
    },
  );
  if (!response.success) {
    console.error("Error editing image:", response.errors);
    return null;
  }
  return response.data.newFilename;
};
