import { Spinner } from "flowbite-react";
import React from "react";
import { useRecoilValueLoadable } from "recoil";
import Project from "../../models/project";
import { currentProjectAtom } from "../../state/atoms";
import { ImagePreview } from "../project/ImagePreview";
import { ImageThumbnails } from "../project/ImageThumbnails";
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
      <ImageThumbnails project={project} />
      <ImagePreview project={project} />
    </div>
  );
}
