import { DefaultValue, atom, selector, selectorFamily } from "recoil";
import { CategoryData } from "../components/tagger/TagCategory";
import {
  Project,
  SelectedImageTags,
  listProjects,
  loadTags,
  saveProject,
  saveTags,
} from "../models/project";

export const showNewProjectModalAtom = atom({
  key: "showNewProjectModal",
  default: false,
});

export const showCropImageModalAtom = atom({
  key: "showCropImageModal",
  default: false,
});

export const disableKeyboardShortcutsSelector = selector<boolean>({
  key: "disableKeyboardShortcuts",
  get: ({ get }) => {
    const modal1 = get(showNewProjectModalAtom);
    const modal2 = get(showCropImageModalAtom);
    const modal3 = get(projectRequiresSetupSelector);
    return modal1 || modal2 || modal3;
  },
});

export const projectsAtom = atom<Project[]>({
  key: "projects",
  default: listProjects(),
});

export const selectedImageTagsAtom = atom<SelectedImageTags | null>({
  key: "selectedImageTags",
  default: null,
});

export const currentProjectSelector = selector<Project | null>({
  key: "currentProjectSelector",
  get: ({ get }) => {
    const projectList = get(projectsAtom);
    const selectedProject = projectList.find((project) => project.isSelected);
    return selectedProject || null;
  },
  set: ({ set, get }, newValue) => {
    if (!(newValue === null || newValue instanceof DefaultValue)) {
      const projectList = get(projectsAtom);
      let foundProject = false;
      const updatedProjectList = projectList.map((project) => {
        if (project.name === newValue?.name) {
          foundProject = true;
          return { ...project, ...newValue, isSelected: true };
        } else {
          return { ...project, isSelected: false };
        }
      });
      // Add the project if we didn't find it.
      if (!foundProject) {
        updatedProjectList.push({
          ...newValue,
          isSelected: true,
        });
      }
      set(projectsAtom, updatedProjectList);
    }
  },
});

export const selectedImageSelector = selector<string>({
  key: "selectedImage",
  get: ({ get }) => {
    const currentProject = get(currentProjectSelector);
    return currentProject
      ? currentProject.selectedImage
      : currentProject?.images[0] || "";
  },
  set: ({ get, set }, newValue) => {
    if (newValue === null || newValue instanceof DefaultValue) return;

    const currentProject = get(currentProjectSelector);
    if (currentProject) {
      const newProject = {
        ...currentProject,
        selectedImage: newValue,
      };
      set(currentProjectSelector, newProject);
      saveProject(newProject);
    }
  },
});

export type SelectedImageTagsProps = {
  projectName: string;
  image: string;
};

export const selectedImgTagsSelector = selectorFamily({
  key: "selectedTags",
  get:
    (params: SelectedImageTagsProps) =>
    async ({ get }) => {
      const imgTags = get(selectedImageTagsAtom);
      if (
        imgTags &&
        imgTags.projectName == params.projectName &&
        imgTags.image === params.image
      ) {
        return imgTags;
      }
      return await loadTags(params.projectName, params.image);
    },
  set:
    (params: SelectedImageTagsProps) =>
    ({ set }, newValue) => {
      if (newValue === null || newValue instanceof DefaultValue) return;
      set(selectedImageTagsAtom, newValue);
      saveTags(params.projectName, params.image, newValue.selected);
    },
});

export const projectRequiresSetupSelector = selector<boolean>({
  key: "projectRequiresSetup",
  get: ({ get }) => {
    const currentProject = get(currentProjectSelector);
    return currentProject ? currentProject.requiresSetup : false;
  },
  set: ({ get, set }, newValue) => {
    if (newValue === null || newValue instanceof DefaultValue) return;

    const currentProject = get(currentProjectSelector);
    if (currentProject) {
      set(currentProjectSelector, {
        ...currentProject,
        requiresSetup: newValue,
      });
    }
  },
});

export type DeleteImageProps = {
  projectName: string;
  filenameToDelete: string;
};

export const deleteImageSelectorFamily = selectorFamily({
  key: "deleteImage",
  get: () => () => {}, // This is no-op
  set:
    (props: DeleteImageProps) =>
    ({ set }) => {
      set(projectsAtom, (projects) => {
        return projects.map((project) => {
          if (project.name === props.projectName) {
            // Store the index for selecting an adjacent image.
            const oldIndex = project.images.indexOf(props.filenameToDelete);

            // Remove the old image.
            const images = project.images.filter(
              (fname) => fname !== props.filenameToDelete,
            );

            return {
              ...project,
              images,
              selectedImage:
                images[oldIndex - 1] ||
                images[oldIndex] ||
                images[oldIndex + 1],
            };
          } else {
            return project;
          }
        });
      });
    },
});

export type ReplaceImageProps = {
  projectName: string;
  oldFile: string;
};

export const replaceImageSelectorFamily = selectorFamily({
  key: "replaceImage",
  get: () => () => {}, // This is no-op
  set:
    (props: ReplaceImageProps) =>
    ({ set }, newValue) => {
      set(projectsAtom, (projects) => {
        const newFilename = String(newValue);
        return projects.map((project) => {
          if (project.name === props.projectName) {
            const images = project.images.map((fname) =>
              fname === props.oldFile ? newFilename : fname,
            );
            return {
              ...project,
              images,
              selectedImage: newFilename,
            };
          } else {
            return project;
          }
        });
      });
    },
});

export const tagLayoutSelector = selector<CategoryData[]>({
  key: "tagLayout",
  get: ({ get }) => {
    const currentProject = get(currentProjectSelector);
    return currentProject ? currentProject.tagLayout : [];
  },
  set: ({ get, set }, newValue) => {
    if (!newValue || newValue instanceof DefaultValue) return;

    const currentProject = get(currentProjectSelector);
    if (currentProject) {
      const newProject = { ...currentProject, tagLayout: newValue };
      set(currentProjectSelector, newProject);
      saveProject(newProject);
    }
  },
});

export type TagAction = {
  categoryTitle: string;
  tag: string;
} | void;

export const addTagToCategorySelector = selector<TagAction>({
  key: "AddTagToCategory",
  get: () => {},
  set: ({ get, set }, newValue) => {
    if (!newValue || newValue instanceof DefaultValue) return;

    const currentTagLayout = get(tagLayoutSelector);
    const newTagLayout = currentTagLayout.map((cat) =>
      cat.title === newValue.categoryTitle
        ? {
            ...cat,
            tags: [newValue.tag, ...cat.tags],
          }
        : cat,
    );
    set(tagLayoutSelector, newTagLayout);
  },
});

export const removeTagFromCategorySelector = selector<TagAction>({
  key: "RemoveTagFromCategory",
  get: () => {},
  set: ({ get, set }, newValue) => {
    if (!newValue || newValue instanceof DefaultValue) return;

    const currentTagLayout = get(tagLayoutSelector);
    const newTagLayout = currentTagLayout.map((cat) =>
      cat.title === newValue.categoryTitle
        ? {
            ...cat,
            tags: cat.tags.filter((tag) => tag !== newValue.tag),
          }
        : cat,
    );
    set(tagLayoutSelector, newTagLayout);
  },
});
