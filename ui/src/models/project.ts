import { ApiResponse, apiRequest, eventRequest } from "../api";
import { CategoryData } from "../components/tagger/TagCategory";

export interface NewProject {
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

export interface SelectedImageTags {
  projectName: string;
  image: string;
  selected: string[];
  autoTags: string[];
}

export interface Project {
  name: string;
  triggerWord: string;
  isSelected: boolean;
  images: string[];
  selectedImage: string;
  autoTags: AutoTag[]; // From our auto-tag analysis.
  tagLayout: CategoryData[]; // The layout of the tags categories.
  requiresSetup: boolean; // We have auto-tag suggestions for the user.
  [key: string]: any; // Add index signature
}

export async function createProject(
  data: NewProject,
): Promise<ApiResponse<Project>> {
  const response = await apiRequest<{}>("/project/create", {
    body: JSON.stringify(data),
  });
  if (response.success && response.data) {
    return {
      success: true,
      data: {
        name: data.name,
        triggerWord: data.triggerWord,
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
          triggerWord: "",
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
    return response.data;
  }
}

export async function saveProject(project: Project): Promise<boolean> {
  const response = await apiRequest<{ result: string }>(
    `/project/${project.name}/save`,
    {
      body: JSON.stringify(project),
    },
  );
  if (response.success && response.data) {
    return response.data.result === "OK";
  }
}

export async function saveTags(
  projectName: string,
  image: string,
  tags: string[],
): Promise<boolean> {
  const response = await apiRequest<{ result: string }>(
    `/project/${projectName}/tags/save`,
    {
      body: JSON.stringify({ image, tags }),
    },
  );
  if (response.success && response.data) {
    return response.data.result === "OK";
  }
}

export async function loadTags(
  projectName: string,
  image: string,
): Promise<SelectedImageTags> {
  const response = await apiRequest<SelectedImageTags>(
    `/project/${projectName}/tags/load?image=${image}`,
  );
  if (response.success && response.data) {
    return response.data;
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

export function previewTagTextFile(
  project: Project,
  selectedTags: string[],
): string {
  if (!selectedTags) {
    selectedTags = [];
  }
  const tags = [];
  if (project.triggerWord) {
    tags.push(project.triggerWord);
  }
  project.tagLayout.map((category) => {
    const selectedFromCat = selectedTags.filter((tag) =>
      category.tags.includes(tag),
    );
    selectedFromCat.forEach((tag) => {
      tags.push(tag);
    });
  });
  return tags.join(", ");
}
