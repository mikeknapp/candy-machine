import { atom, selector } from "recoil";
import Project from "../models/project";

export const showNewProjectDialogAtom = atom({
  key: "showNewProjectDialog",
  default: false,
});

export const projectsAtom = atom<Project[]>({
  key: "projects",
  default: Project.list(),
});

export const currentProjectAtom = atom<Project | null>({
  key: "currentProject",
  default: selector({
    key: "currentProject/Default",
    get: async ({ get }) => {
      const projectList = get(projectsAtom);
      if (projectList.length > 0) {
        return await Project.load(projectList[0].dirName);
      }
      return null;
    },
  }),
});

export const selectedImageAtom = atom<string | null>({
  key: "selectedImage",
  default: selector({
    key: "selectedImage/Default",
    get: ({ get }) => {
      const currentProject = get(currentProjectAtom);
      if (currentProject) {
        return currentProject.images[0];
      }
      return null;
    },
  }),
});
