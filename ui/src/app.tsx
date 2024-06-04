import type { CustomFlowbiteTheme } from "flowbite-react";
import { Flowbite } from "flowbite-react";
import React, { createContext, useEffect } from "react";
import { ErrorBoundary } from "./components/errors/ErrorBoundary";
import { Editor } from "./components/layout/Editor";
import { Header } from "./components/layout/Header";
import { UseTagSearch, useTagSearch } from "./hooks/useTagSearch";
import { App } from "./models/app";

const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      default: "bg-green-500",
    },
  },
};

export const appState = App.getInstance();
export const AppContext = createContext<App>(appState);

export const TagSearchContext = createContext<UseTagSearch>(null);

export function RootNode() {
  useEffect(() => {
    const loadProjects = async () => {
      const projects = await appState.load();
      if (projects.length > 0) {
        await appState.project.loadProject(projects[0]);
      }
    };
    setTimeout(loadProjects, 0);
  }, []);

  return (
    <ErrorBoundary
      fallback={<div>Oops! Something went wrong. Check the console.</div>}
    >
      <Flowbite theme={{ theme: customTheme }}>
        <AppContext.Provider value={appState}>
          <TagSearchContext.Provider value={useTagSearch()}>
            <main className="flex h-screen w-full flex-col overflow-hidden dark:bg-gray-800">
              <Header />
              <Editor />
            </main>
          </TagSearchContext.Provider>
        </AppContext.Provider>
      </Flowbite>
    </ErrorBoundary>
  );
}
