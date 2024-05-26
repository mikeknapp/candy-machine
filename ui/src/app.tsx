import type { CustomFlowbiteTheme } from "flowbite-react";
import { Flowbite } from "flowbite-react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RecoilRoot } from "recoil";
import { Editor } from "./components/layout/Editor.js";
import { Header } from "./components/nav/Header.js";
import { CreateProjectModal } from "./components/project/CreateProjectModal.js";

const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      default: "bg-green-500",
    },
  },
};

export function App() {
  return (
    <Flowbite theme={{ theme: customTheme }}>
      <RecoilRoot>
        <DndProvider backend={HTML5Backend}>
          <main className="flex h-screen w-full flex-col overflow-hidden dark:bg-gray-800">
            <Header />
            <Editor />
            <CreateProjectModal />
          </main>
        </DndProvider>
      </RecoilRoot>
    </Flowbite>
  );
}
