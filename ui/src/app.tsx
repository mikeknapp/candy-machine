import type { CustomFlowbiteTheme } from "flowbite-react";
import { Flowbite } from "flowbite-react";
import React from "react";
import { RecoilRoot } from "recoil";
import { ErrorBoundary } from "./components/errors/ErrorBoundary";
import { Editor } from "./components/layout/Editor";
import { Header } from "./components/nav/Header";
import { CreateProjectModal } from "./components/project/CreateProjectModal";
import { Project } from "./models/project";
import { ProjectList } from "./models/project_list";

const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      default: "bg-green-500",
    },
  },
};

export const allProjects = ProjectList.getInstance();
export const currentProject = Project.getInstance();

export const AllProjectsContext = React.createContext<ProjectList>(allProjects);
export const ProjectContext = React.createContext<Project>(currentProject);

export function App() {
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
