import { atom, selector } from "recoil";
import { Project, listProjects, loadProject } from "../models/project";

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

export const currentProjectAtom = atom<Project | null>({
  key: "currentProject",
  default: selector({
    key: "currentProject/Default",
    get: async ({ get }) => {
      const projectList = get(projectsAtom);
      if (projectList.length > 0) {
        return await loadProject(projectList[0].name);
      }
      return null;
    },
  }),
});
