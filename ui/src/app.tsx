import type { CustomFlowbiteTheme } from "flowbite-react";
import { Flowbite } from "flowbite-react";
import React, { useEffect } from "react";
import { RecoilRoot } from "recoil";
import { ErrorBoundary } from "./components/errors/ErrorBoundary";
import { Editor } from "./components/layout/Editor";
import { Header } from "./components/nav/Header";
import { CreateProjectModal } from "./components/project/CreateProjectModal";
import { AllProjects } from "./models/all_projects";
import { Project } from "./models/project";

const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      default: "bg-green-500",
    },
  },
};

export const allProjects = AllProjects.getInstance();
export const currentProject = Project.getInstance();

export const AllProjectsContext = React.createContext<AllProjects>(allProjects);
export const ProjectContext = React.createContext<Project>(currentProject);

export function App() {
  useEffect(() => {
    // Load projects here so components can observe the loading state.
    new Promise(() => allProjects.load());
  }, []);

  return (
    <ErrorBoundary
      fallback={<div>Oops! Something went wrong. Check the console.</div>}
    >
      <Flowbite theme={{ theme: customTheme }}>
        <AllProjectsContext.Provider value={allProjects}>
          <ProjectContext.Provider value={currentProject}>
            <RecoilRoot>
              <main className="flex h-screen w-full flex-col overflow-hidden dark:bg-gray-800">
                <Header />
                <Editor />
                <CreateProjectModal />
              </main>
            </RecoilRoot>
          </ProjectContext.Provider>
        </AllProjectsContext.Provider>
      </Flowbite>
    </ErrorBoundary>
  );
}
