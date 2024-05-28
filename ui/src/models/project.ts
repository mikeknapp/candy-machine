import { ApiResponse, apiRequest, eventRequest } from "../api";
import { CategoryData } from "../components/tagger/TagCategory";

export interface NewProject {
  name: string;
  importDirPath: string;
  removeDuplicates: boolean;
}

export interface AutoTag {
  tag: string;
  count: number;
  examples: string[];
}

export interface Project {
  name: string;
  isSelected: boolean;
  images: string[];
  selectedImage: string;
  autoTags: AutoTag[];
  tagLayout: CategoryData[];
  requiresSetup: boolean;
}

export async function createProject(
  data: NewProject,
): Promise<ApiResponse<Project>> {
  const response = await apiRequest<string>("/project/create", {
    body: JSON.stringify(data),
  });
  if (response.success && response.data) {
    return {
      success: true,
      data: {
        name: data.name,
        isSelected: false,
        images: [],
        selectedImage: "",
        autoTags: [],
        tagLayout: [],
        requiresSetup: false,
      },
    };
  } else {
    return { success: false, errors: response.errors };
  }
}

export async function listProjects(): Promise<Project[]> {
  const response = await apiRequest<string[]>("/projects/list");
  if (response.success && response.data) {
    return await Promise.all(
      response.data.map(async (name, i) => {
        if (i === 0) {
          const p = await loadProject(name);
          return { ...p, isSelected: true };
        }
        return {
          name: name,
          isSelected: false,
          images: [],
          selectedImage: "",
          autoTags: [],
          tagLayout: [],
          requiresSetup: false,
        };
      }),
    );
  } else {
    console.error(`Error fetching projects: ${response.errors}`);
  }
  return [];
}

export async function loadProject(name: string): Promise<Project> {
  const response = await apiRequest<Project>(`/project/${name}/get`);
  if (response.success && response.data) {
    return { ...response.data, selectedImage: response.data.images[0] ?? "" };
  }
}

export async function importImages(
  project: Project,
  importPath: string,
  removeDuplicates: boolean,
  onMessage: (msg: string) => void,
): Promise<boolean> {
  return await eventRequest(
    `/project/${project.name}/import?path=${encodeURIComponent(importPath)}&remove_duplicates=${removeDuplicates}`,
    onMessage,
  );
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
