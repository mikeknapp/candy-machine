import { Button, Tooltip } from "flowbite-react";
import React from "react";
import { HiCog6Tooth, HiFolderPlus } from "react-icons/hi2";
import { useSetRecoilState } from "recoil";
import { showNewProjectDialog } from "../../state/atoms";
import { ProjectSelector } from "./ProjectSelector";

export function Header() {
  const openNewProjectDialog = useSetRecoilState(showNewProjectDialog);

  return (
    <div className="bg-accent flex w-full flex-row items-center justify-between p-3 dark:bg-slate-600">
      <span className="text-gray text-base font-bold text-gray-700 dark:text-white">
        <img
          src={require("../../assets/logo.png")}
          alt="Candy Machine Logo"
          className="aspect-square h-12 dark:rounded-full"
        />
      </span>
      <div className="flex h-full flex-row items-center gap-2">
        <ProjectSelector />

        <Tooltip content="New Project">
          <Button
            gradientDuoTone="pinkToOrange"
            onClick={() => openNewProjectDialog(true)}
          >
            <HiFolderPlus className="text-2xl font-bold" />
          </Button>
        </Tooltip>
        <Tooltip content="Settings">
          <Button gradientDuoTone="pinkToOrange">
            <HiCog6Tooth className="text-2xl font-bold" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
