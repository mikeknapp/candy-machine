import { ApiResponse, apiRequest } from "../api";

export interface NewProjectData {
  dirName: string;
  importDirPath: string;
  autoFileFormat: boolean;
  autoFileNaming: boolean;
}

export interface ProjectData {
  dirName: string;
  images: string[];
}

class Project {
  dirName: string;
  images: string[] = [];

  constructor(dirName: string, images: string[] = []) {
    this.dirName = dirName;
    this.images = images;
  }

  navigateImages(
    selectedImage: string,
    direction: "next" | "previous",
  ): string {
    // Returns the name of the next or previous image in the list.
    const currentIndex = this.images.indexOf(selectedImage);
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
      case "previous":
        const previousIndex = currentIndex - 1;
        if (previousIndex >= 0) {
          return this.images[previousIndex];
        }
        break;
    }
  }

  static async load(dirName: string): Promise<Project> {
    const response = await apiRequest<ProjectData>(`/project/${dirName}/get`);
    if (response.success && response.data) {
      return new Project(response.data.dirName, response.data.images);
    }
    return null;
  }

  static async create(data: NewProjectData): Promise<ApiResponse<Project>> {
    const response = await apiRequest<Project>("/projects/create", {
      body: JSON.stringify(data),
    });
    if (response.success && response.data) {
      return { success: true, data: new Project(response.data.dirName) };
    }
    return response;
  }

  static async list(): Promise<Project[]> {
    const response = await apiRequest<string[]>("/projects/list");
    if (response.success && response.data) {
      return response.data.map((name) => new Project(name));
    } else {
      console.error(`Error fetching projects: ${response.errors}`);
    }
    return [];
  }
}

export default Project;
