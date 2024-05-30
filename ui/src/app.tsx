import type { CustomFlowbiteTheme } from "flowbite-react";
import { Flowbite } from "flowbite-react";
import React from "react";
import { RecoilRoot } from "recoil";
import { ErrorBoundary } from "./components/errors/ErrorBoundary";
import { Editor } from "./components/layout/Editor";
import { Header } from "./components/nav/Header";
import { CreateProjectModal } from "./components/project/CreateProjectModal";

const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      default: "bg-green-500",
    },
  },
};

export function App() {
  return (
    <ErrorBoundary
      fallback={<div>Oops! Something went wrong. Check the console.</div>}
    >
      <Flowbite theme={{ theme: customTheme }}>
        <RecoilRoot>
          <main className="flex h-screen w-full flex-col overflow-hidden dark:bg-gray-800">
            <Header />
            <Editor />
            <CreateProjectModal />
          </main>
        </RecoilRoot>
      </Flowbite>
    </ErrorBoundary>
  );
}
