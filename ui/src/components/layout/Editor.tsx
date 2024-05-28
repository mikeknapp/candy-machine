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

  return (
    <div className="flex h-[calc(100vh-80px)] flex-row">
      <Thumbnails />
      <SelectedImage />
      <Tagger />
    </div>
  );
}
