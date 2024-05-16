import { Button, Tooltip } from "flowbite-react";
import React from "react";
import { useSetRecoilState } from "recoil";
import { showNewProjectDialog } from "../../state/atoms";
import { CogSvg } from "../svg/CogSvg";
import { PlusSvg } from "../svg/PlusSvg";

export function Header() {
  const openNewProjectDialog = useSetRecoilState(showNewProjectDialog);

  return (
    <div className="flex w-full flex-row items-center justify-between bg-brand p-3 dark:bg-slate-600">
      <span className="text-gray text-base font-bold text-pink-900 dark:text-white">
        CANDY MACHINE
      </span>
      <div className="flex flex-row gap-2">
        <Tooltip content="New Project">
          <Button
            gradientDuoTone="pinkToOrange"
            onClick={() => openNewProjectDialog(true)}
          >
            <PlusSvg className="text-white" />
          </Button>
        </Tooltip>
        <Tooltip content="Settings">
          <Button gradientDuoTone="pinkToOrange">
            <CogSvg className="text-white" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
