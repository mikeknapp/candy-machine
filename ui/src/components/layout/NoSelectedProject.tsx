import { Button } from "flowbite-react";
import React from "react";
import { useApp } from "../../hooks/useApp";

export function NoSelectedProject() {
  const app = useApp();

  return (
    <div className="flex h-screen w-full flex-row items-center justify-center">
      <Button
        gradientDuoTone="pinkToOrange"
        outline
        onClick={() => (app.showCreateProjectModal = true)}
      >
        Create Your First Project
      </Button>
    </div>
  );
}
