import { Button, DarkThemeToggle, Tooltip } from "flowbite-react";
import React from "react";
import { HiFolderPlus } from "react-icons/hi2";
import { useAppState } from "../../hooks/useApp";
import { CreateProjectModal } from "../project/CreateProjectModal";
import { ProjectSelector } from "../project/ProjectSelector";
import { ShortcutsModal } from "./ShortcutsModal";

export function Header() {
  const [appValue, app] = useAppState("isLoading", "isError");

  return (
    <div className="flex h-[80px] w-full flex-row items-center justify-between bg-accent p-3 dark:bg-slate-950">
      <div className="text-gray text-base font-bold text-gray-700 dark:text-white">
        <img
          src={require("../../assets/logo.png")}
          alt="Candy Machine"
          className="aspect-square h-20 dark:rounded-full"
        />
      </div>
      <div className="flex h-full flex-row items-center gap-2">
        <ProjectSelector />

        {!appValue.isLoading && !appValue.isError && (
          <Tooltip content="New Project">
            <Button
              size="lg"
              gradientDuoTone="pinkToOrange"
              onClick={() => (app.showCreateProjectModal = true)}
            >
              <HiFolderPlus className="text-2xl font-bold" />
            </Button>
          </Tooltip>
        )}

        <Tooltip content="Toggle Dark Mode">
          <DarkThemeToggle
            theme={{
              root: {
                base: "rounded-lg p-2.5 text-sm text-white hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700",
                icon: "h-6 w-6 text-white",
              },
            }}
          />
        </Tooltip>
      </div>

      <CreateProjectModal />
      <ShortcutsModal />
    </div>
  );
}
