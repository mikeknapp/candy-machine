import { PixelCrop } from "react-image-crop";
import { apiRequest } from "../api";
import { Project, Project_old } from "./project";

export interface SelectedImageTags {
  projectName: string;
  image: string;
  selected: string[];
  autoTags: string[];
}

export class Image {
  public filename: string;
  public tags: string[] = [];

  constructor(filename: string, tags: string[] = []) {
    this.filename = filename;
    this.tags = tags;
  }

  static async load(projectName: string, filename: string): Promise<Image> {
    const response = await apiRequest<{
      autoTags: string[];
      image: string;
      projectName: string;
      selected: string[];
    }>(`/project/${projectName}/tags/load?image=${filename}`, {
      method: "GET",
    });
    if (response.success && response.data) {
      return new Image(filename, response.data.selected);
    }
    throw new Error(`Failed to load image: ${response.errors}`);
  }

  public async saveTags(project: Project_old): Promise<boolean> {
    const response = await apiRequest<{ result: string }>(
      `/project/${project.name}/tags/save`,
      {
        body: JSON.stringify({ image: this.filename, tags: this.tags }),
      },
    );
    if (response.success && response.data) {
      return response.data.result === "OK";
    }
  }

  public async loadTags(project: Project_old): Promise<string[]> {
    const response = await apiRequest<string[]>(
      `/project/${project.name}/tags/load?image=${this.filename}`,
    );
    if (response.success && response.data) {
      this.tags = response.data;
      return response.data;
    }
  }

  public previewTagTextFile(project: Project): string {
    const tags = [];
    if (project.triggerWord) {
      tags.push(project.triggerWord);
    }
    project.tagLayout.map((category) => {
      const selectedFromCat = this.tags.filter((tag) =>
        category.tags.includes(tag),
      );
      selectedFromCat.forEach((tag) => {
        tags.push(tag);
      });
    });
    return tags.join(", ");
  }
}

export const imgSize = (
  filename: string,
): { width: number; height: number } => {
  // Extract the height and width from the image ID i.e. f4227273f1f071f_589x753_0.png
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
