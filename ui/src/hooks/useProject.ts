import { useContext, useEffect, useState } from "react";
import { AllProjectsContext, ProjectContext } from "../app";
import { Project, ProjectData } from "../models/project";

export function useProject(): [ProjectData, Project] {
  let projectContext = useContext(ProjectContext);
  let allProjectsContext = useContext(AllProjectsContext);
  const [project, setProject] = useState<ProjectData>(null);

  useEffect(() => {
    if (!projectContext) return;
    // Update the project state when notifySubscribers is called.
    const listener = () => setProject(projectContext.readOnly);
    projectContext.subscribe(listener);
    return () => projectContext.unsubscribe(listener);
  }, []);

  useEffect(() => {
    if (!allProjectsContext) return;
    const listener = async () => {
      // Load the first project in the list.
      if (project !== null && allProjectsContext.hasValues) {
        const firstProject = allProjectsContext.allProjects[0];
        await projectContext.loadProject(firstProject);
      }
    };
    allProjectsContext.subscribe(listener);
    return () => allProjectsContext.unsubscribe(listener);
  }, []);

  return [project, projectContext];
}
