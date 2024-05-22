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

      // If the project isn't in the projects list, add it.
      if (!projectList.find((project) => project.name === newValue?.name)) {
        set(projectsAtom, [...projectList, newValue]);
      }

      // Set the isSelected flag and any other changes.
      const updatedProjectList = projectList.map((project) => {
        if (project.name === newValue?.name) {
          return { ...project, ...newValue, isSelected: true };
        } else {
          return { ...project, isSelected: false };
        }
      });
      set(projectsAtom, updatedProjectList);
    }
  },
});
