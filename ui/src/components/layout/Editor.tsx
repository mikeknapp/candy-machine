import { Spinner } from "flowbite-react";
import React from "react";
import { useRecoilValueLoadable } from "recoil";
import { currentProjectSelector } from "../../state/atoms";
import { SelectedImage } from "../image/SelectedImage";
import { Thumbnails } from "../project/Thumbnails";
import { Tagger } from "../tagger/Tagger";
import { NoSelectedProject } from "./NoSelectedProject";

export function Editor() {
  const projectLoading = useRecoilValueLoadable(currentProjectSelector);

  if (projectLoading.state === "loading") {
    return (
      <div className="center-full">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!projectLoading.contents) {
    return <NoSelectedProject />;
  }

  // TODO: stop passing down project as a prop.
  const project = projectLoading.contents;

  return (
    <div className="flex h-[calc(100vh-80px)] flex-row">
      <Thumbnails project={project} />
      <SelectedImage project={project} />
      <Tagger />
    </div>
  );
}
