import { Spinner } from "flowbite-react";
import React from "react";
import { useAppValue } from "../../hooks/useApp";
import { useProjectValue } from "../../hooks/useProject";
import { SelectedImage } from "../image/SelectedImage";
import { Thumbnails } from "../project/Thumbnails";
import { Tagger } from "../tagger/Tagger";
import { NoSelectedProject } from "./NoSelectedProject";

export function Editor() {
  const app = useAppValue();
  const project = useProjectValue();

  if (app.isLoading || project.isLoading) {
    return (
      <div className="center-full">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!project) {
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
