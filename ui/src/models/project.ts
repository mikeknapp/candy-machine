import { ApiResponse, apiRequest } from "../api";

export interface NewProject {
  name: string;
  importDirPath: string;
}

export interface Project {
  name: string;
  images: string[];
  selectedImage: string;
}

export async function createProject(
  data: NewProject,
): Promise<ApiResponse<Project>> {
  const response = await apiRequest<Project>("/projects/create", {
    body: JSON.stringify(data),
  });
  if (response.success && response.data) {
    return { success: true, data: response.data };
  }
  return response;
}

export async function listProjects(): Promise<Project[]> {
  const response = await apiRequest<string[]>("/projects/list");
  if (response.success && response.data) {
    return response.data.map((name) => ({
      name: name,
      images: [],
      selectedImage: "",
    }));
  } else {
    console.error(`Error fetching projects: ${response.errors}`);
  }
  return [];
}

export async function loadProject(name: string): Promise<Project> {
  const response = await apiRequest<Project>(`/project/${name}/get`);
  if (response.success && response.data) {
    console.log(response.data);
    return { ...response.data, selectedImage: response.data.images[0] ?? "" };
  }
}

export function navigateImages(
  project: Project,
  direction: "next" | "prev",
): string {
  // Returns the name of the next or previous image in the list.
  const currentIndex = project.images.indexOf(project.selectedImage);
  if (currentIndex === -1) {
    return;
  }
  switch (direction) {
    case "next":
      const nextIndex = currentIndex + 1;
      if (nextIndex < project.images.length) {
        return project.images[nextIndex];
      }
      break;
    case "prev":
      const previousIndex = currentIndex - 1;
      if (previousIndex >= 0) {
        return project.images[previousIndex];
      }
      break;
  }
}
