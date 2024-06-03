import { useContext, useState } from "react";
import { AllProjectsContext, ProjectContext } from "../app";
import { AllProjectData } from "../models/all_projects";
import { Project, ProjectData } from "../models/project";
import { useSubscribe } from "./useSubscribe";

export function useProject(loadDefaultProject = false): [ProjectData, Project] {
  let projectContext = useContext(ProjectContext);

  const [projectData, setProjectData] = useState<ProjectData>(null);

  // Listen to updates from the selected project.
  useSubscribe(ProjectContext, (newValue: ProjectData) => {
    setProjectData(newValue);
  });

  // Choose an initial project once the project list has loaded.
  useSubscribe(AllProjectsContext, async (newValue: AllProjectData) => {
    if (
      loadDefaultProject &&
      projectData === null &&
      newValue.projects.length > 0
    ) {
      const firstProject = newValue.projects[0];
      await projectContext.loadProject(firstProject);
    }
  });

  return [projectData, projectContext];
}

export function useProjectValue(loadDefaultProject = false): ProjectData {
  const project = useProject(loadDefaultProject);
  return project[0];
}
