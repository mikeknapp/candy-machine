import { DefaultValue, atom, selector, selectorFamily } from "recoil";
import { CategoryData } from "../components/tagger/TagCategory";
import { Project, listProjects } from "../models/project";

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
    return modal1 || modal2;
  },
});

export const projectsAtom = atom<Project[]>({
  key: "projects",
  default: listProjects(),
});

export const currentProjectSelector = selector<Project | null>({
  key: "currentProjectSelector",
  get: ({ get }) => {
    const projectList = get(projectsAtom);
    const selectedProject = projectList.find((project) => project.isSelected);
    return selectedProject || null;
  },
  set: ({ set, get }, newValue) => {
    if (!(newValue instanceof DefaultValue)) {
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

export const projectRequiresSetupSelector = selector<boolean>({
  key: "projectRequiresSetup",
  get: ({ get }) => {
    const currentProject = get(currentProjectSelector);
    return currentProject ? currentProject.requiresSetup : false;
  },
  set: ({ get, set }, newValue) => {
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
    const currentProject = get(currentProjectSelector);
    if (currentProject) {
      set(currentProjectSelector, {
        ...currentProject,
        tagLayout: newValue,
      });
      // TODO: Auto save to the server.
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
