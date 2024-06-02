import { useContext, useState } from "react";
import { AllProjectsContext, ProjectContext } from "../app";
import { Project, ProjectData } from "../models/project";
import { useSubscribe } from "./useSubscribe";

export function useProject(): [ProjectData, Project] {
  let projectContext = useContext(ProjectContext);
  let allProjectsContext = useContext(AllProjectsContext);

  const [projectData, setProjectData] = useState<ProjectData>(null);

  // Listen to updates from the selected project.
  useSubscribe(
    ProjectContext,
    (newValue: ProjectData) => setProjectData(newValue),
    [projectData],
  );

  // Choose an initial project once the project list has loaded.
  useSubscribe(
    AllProjectsContext,
    async () => {
      if (projectData === null && allProjectsContext.hasProjects) {
        const firstProject = allProjectsContext.projects[0];
        await projectContext.loadProject(firstProject);
      }
    },
    [projectData, allProjectsContext],
  );

  return [projectData, projectContext];
}

export function useProjectValue(): ProjectData {
  const project = useProject();
  return project[0];
}
