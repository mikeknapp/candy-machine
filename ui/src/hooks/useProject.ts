import { useContext, useState } from "react";
import { AllProjectsContext, ProjectContext } from "../app";
import { Project, ProjectData } from "../models/project";
import { useSubscribe } from "./useSubscribe";

export function useProject(): [ProjectData, Project] {
  let project = useContext(ProjectContext);
  let allProjects = useContext(AllProjectsContext);

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
      if (projectData === null && allProjects.hasValues) {
        const firstProject = allProjects.allProjects[0];
        await project.loadProject(firstProject);
      }
    },
    [projectData, allProjects],
  );

  return [projectData, project];
}
