import { useContext, useEffect, useState } from "react";
import { AllProjectsContext } from "../app";

export function useAllProjects() {
  const projectsList = useContext(AllProjectsContext);
  const [projects, setProjects] = useState<string[]>([]);

  useEffect(() => {
    const listener = () => setProjects([...projectsList.allProjects]);
    projectsList.subscribe(listener);
    return () => projectsList.unsubscribe(listener);
  }, [projectsList]);

  // TODO: return data + context
  return projects;
}
