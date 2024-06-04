import type { CustomFlowbiteTheme } from "flowbite-react";
import { Flowbite } from "flowbite-react";
import React, { useEffect } from "react";
import { RecoilRoot } from "recoil";
import { ErrorBoundary } from "./components/errors/ErrorBoundary";
import { Editor } from "./components/layout/Editor";
import { Header } from "./components/layout/Header";
import { App } from "./models/app";
import { Project } from "./models/project";

const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      default: "bg-green-500",
    },
  },
};

export const app = App.getInstance();
export const currentProject = Project.getInstance();

export const AppContext = React.createContext<App>(app);
export const ProjectContext = React.createContext<Project>(currentProject);

export function RootNode() {
  useEffect(() => {
    const loadProjects = async () => {
      const projects = await app.load();
      if (projects.length > 0) {
        await currentProject.loadProject(projects[0]);
      }
    };
    setTimeout(loadProjects, 0);
  }, []);

  return (
    <ErrorBoundary
      fallback={<div>Oops! Something went wrong. Check the console.</div>}
    >
      <Flowbite theme={{ theme: customTheme }}>
        <AppContext.Provider value={app}>
          <ProjectContext.Provider value={currentProject}>
            <RecoilRoot>
              <main className="flex h-screen w-full flex-col overflow-hidden dark:bg-gray-800">
                <Header />
                <Editor />
              </main>
            </RecoilRoot>
          </ProjectContext.Provider>
        </AppContext.Provider>
      </Flowbite>
    </ErrorBoundary>
  );
}
