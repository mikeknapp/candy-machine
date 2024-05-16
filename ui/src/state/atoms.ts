import { atom } from "recoil";
import Project from "../models/project";

export const showNewProjectDialog = atom({
  key: "showNewProjectDialog",
  default: false,
});

export const projects = atom<Project[]>({
  key: "projects",
  default: Project.list(),
});
