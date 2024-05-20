import { Button, DarkThemeToggle, Tooltip } from "flowbite-react";
import React from "react";
import { HiCog6Tooth, HiFolderPlus } from "react-icons/hi2";
import { useSetRecoilState } from "recoil";
import { showNewProjectModalAtom } from "../../state/atoms";
import { ProjectSelector } from "./ProjectSelector";

export function Header() {
  const openNewProjectDialog = useSetRecoilState(showNewProjectModalAtom);

  return (
    <div className="flex w-full flex-row items-center justify-between bg-accent p-3 shadow-xl dark:bg-slate-950">
      <div className="text-gray text-base font-bold text-gray-700 dark:text-white">
        <img
          src={require("../../assets/logo.png")}
          alt="Candy Machine Logo"
          className="aspect-square h-12 dark:rounded-full"
        />
      </div>
      <div className="flex h-full flex-row items-center gap-2">
        <ProjectSelector />

        <Tooltip content="New Project">
          <Button
            size="lg"
            gradientDuoTone="pinkToOrange"
            onClick={() => openNewProjectDialog(true)}
          >
            <HiFolderPlus className="text-2xl font-bold" />
          </Button>
        </Tooltip>

        <Tooltip content="Settings">
          <Button size="lg" gradientDuoTone="pinkToOrange">
            <HiCog6Tooth className="text-2xl font-bold" />
          </Button>
        </Tooltip>

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
    </div>
  );
}
