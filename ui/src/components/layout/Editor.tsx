import { Spinner } from "flowbite-react";
import React from "react";
import { useRecoilValueLoadable } from "recoil";
import Project from "../../models/project";
import { currentProjectAtom } from "../../state/atoms";
import { SelectedImage } from "../image/SelectedImage";
import { Thumbnails } from "../project/Thumbnails";
import { NoSelectedProject } from "./NoSelectedProject";

export function Editor() {
  const projectLoading = useRecoilValueLoadable(currentProjectAtom);

  if (projectLoading.state === "loading") {
    return (
      <div className="center-full">
        <Spinner size="xl" />
      </div>
    );
  }

  const project: Project = projectLoading.contents;

  if (!project) {
    return <NoSelectedProject />;
  }

  return (
    <div className="flex h-full flex-row">
      <Thumbnails project={project} />
      <SelectedImage project={project} />
    </div>
  );
}
