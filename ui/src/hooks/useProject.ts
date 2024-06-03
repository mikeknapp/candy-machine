import { useContext, useState } from "react";
import { ProjectContext } from "../app";
import { DEFAULT_PROJECT_DATA, Project, ProjectData } from "../models/project";
import { useSubscribe } from "./useSubscribe";

export function useProjectState(): [ProjectData, Project] {
  let projectContext = useContext(ProjectContext);

  const [projectValue, project] = useState<ProjectData>(DEFAULT_PROJECT_DATA);

  // Listen to updates from the selected project.
  useSubscribe(ProjectContext, (newValue: ProjectData) => {
    project(newValue);
  });

  return [projectValue, projectContext];
}

export function useProjectValue(): ProjectData {
  return useProjectState()[0];
}

export function useProject(): Project {
  return useProjectState()[1];
}
