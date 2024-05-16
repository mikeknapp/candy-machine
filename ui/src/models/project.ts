import { apiRequest, ApiResponse } from "../api";

export interface ProjectData {
  dirName: string;
  importDirPath: string;
  autoFileFormat: boolean;
  autoFileNaming: boolean;
}

class Project {
  dirName: string;
  importDirPath: string;
  autoFileFormat: boolean;
  autoFileNaming: boolean;

  constructor(data: ProjectData) {
    this.dirName = data.dirName;
    this.importDirPath = data.importDirPath;
    this.autoFileFormat = data.autoFileFormat;
    this.autoFileNaming = data.autoFileNaming;
  }

  static async create(data: ProjectData): Promise<ApiResponse<Project>> {
    const response = await apiRequest<ProjectData>("/projects/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.success && response.data) {
      return { success: true, data: new Project(response.data) };
    }
    return response;
  }

  static async list(): Promise<ApiResponse<Project[]>> {
    const response = await apiRequest<ProjectData[]>("/projects/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.map(
          (projectData: ProjectData) => new Project(projectData),
        ),
      };
    }
    return response;
  }
}

export default Project;
