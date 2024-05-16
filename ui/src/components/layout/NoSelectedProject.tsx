import { Button } from "flowbite-react";
import React from "react";
import { useSetRecoilState } from "recoil";
import { showNewProjectDialog } from "../../state/atoms";
import { CreateProjectModal } from "../projects/CreateProjectModal";

export function NoSelectedProject() {
  const openNewProjectDialog = useSetRecoilState(showNewProjectDialog);

  return (
    <div className="flex h-screen w-full flex-row items-center justify-center">
      <Button
        gradientDuoTone="pinkToOrange"
        outline
        onClick={() => openNewProjectDialog(true)}
      >
        Create Your First Project
      </Button>
      <CreateProjectModal />
    </div>
  );
}
