import { DefaultValue, atom, selector } from "recoil";
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
