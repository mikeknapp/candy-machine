import { Button } from "flowbite-react";
import React from "react";
import { useSetRecoilState } from "recoil";
import { showNewProjectDialogAtom } from "../../state/atoms";

export function NoSelectedProject() {
  const openNewProjectDialog = useSetRecoilState(showNewProjectDialogAtom);

  return (
    <div className="flex h-screen w-full flex-row items-center justify-center">
      <Button
        gradientDuoTone="pinkToOrange"
        outline
        onClick={() => openNewProjectDialog(true)}
      >
        Create Your First Project
      </Button>
    </div>
  );
}
