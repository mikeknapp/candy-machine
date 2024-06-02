import { useContext, useState } from "react";
import { AllProjectsContext } from "../app";
import { AllProjectData, AllProjects } from "../models/all_projects";
import { State } from "../models/base";
import { useSubscribe } from "./useSubscribe";

export function useAllProjects(): [AllProjectData, AllProjects] {
  const allProjectsContext = useContext(AllProjectsContext);

  const [allProjectsData, setAllProjects] = useState<AllProjectData>({
    projects: [],
    state: State.Init,
    isLoading: true,
  });

  useSubscribe(
    AllProjectsContext,
    (newValue: AllProjectData) => setAllProjects(newValue),
    [null, allProjectsData],
  );

  return [allProjectsData, allProjectsContext];
}

export function useAllProjectsValue() {
  const [allProjectsData, _] = useAllProjects();
  return allProjectsData;
}
