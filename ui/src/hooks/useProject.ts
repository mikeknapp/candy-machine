import { useContext, useState } from "react";
import { AppContext } from "../app";
import { AppData } from "../models/app";
import { DEFAULT_PROJECT_DATA, Project, ProjectData } from "../models/project";
import { useSubscribe } from "./useSubscribe";

export function useProjectState(): [ProjectData, Project] {
  let appContext = useContext(AppContext);

  const [projectValue, setProject] =
    useState<ProjectData>(DEFAULT_PROJECT_DATA);

  // Listen to updates from the selected project.
  useSubscribe(AppContext, (newValue: AppData) => {
    setProject(newValue.project);
  });

  return [projectValue, appContext.project];
}

export function useProjectValue(): ProjectData {
  return useProjectState()[0];
}

export function useProject(): Project {
  return useProjectState()[1];
}
