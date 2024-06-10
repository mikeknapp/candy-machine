import type { CustomFlowbiteTheme } from "flowbite-react";
import { Flowbite } from "flowbite-react";
import React, { createContext, useEffect } from "react";
import { ErrorBoundary } from "./components/errors/ErrorBoundary";
import { Editor } from "./components/layout/Editor";
import { Header } from "./components/layout/Header";
import { App } from "./models/app";
import {
  DEFAULT_TAG_SEARCH,
  TagSearch,
  TagSearchProvider,
} from "./providers/TagSearch";

const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      default: "bg-green-500",
    },
  },
};

export const appState = App.getInstance();
export const AppContext = createContext<App>(appState);

export const TagSearchContext =
  createContext<TagSearchProvider>(DEFAULT_TAG_SEARCH);

export function RootNode() {
  useEffect(() => {
    appState.load();
  }, []);

  return (
    <ErrorBoundary
      fallback={<div>Oops! Something went wrong. Check the console.</div>}
    >
      <Flowbite theme={{ theme: customTheme }}>
        <AppContext.Provider value={appState}>
          <TagSearchContext.Provider value={TagSearch()}>
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
