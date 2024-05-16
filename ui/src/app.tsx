import type { CustomFlowbiteTheme } from "flowbite-react";
import { DarkThemeToggle, Flowbite, Tooltip } from "flowbite-react";
import React from "react";
import { RecoilRoot } from "recoil";
import { NoSelectedProject } from "./components/layout/NoSelectedProject.js";
import { Header } from "./components/nav/Header.js";

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
        <main className="flex h-screen w-screen flex-col overflow-hidden dark:bg-gray-800">
          <Header />
          <NoSelectedProject />
          <div className="fixed bottom-2 left-2 w-52">
            <Tooltip content="Toggle Dark Mode">
              <DarkThemeToggle />
            </Tooltip>
          </div>
        </main>
      </RecoilRoot>
    </Flowbite>
  );
}
