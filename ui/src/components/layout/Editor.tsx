import { Spinner } from "flowbite-react";
import React from "react";
import { useAppValue } from "../../hooks/useApp";
import { SelectedImage } from "../image/SelectedImage";
import { ErrorSavingModal } from "../project/ErrorSavingModal";
import { Thumbnails } from "../project/Thumbnails";
import { Tagger } from "../tagger/Tagger";
import { NoSelectedProject } from "./NoSelectedProject";

export function Editor() {
  const appValue = useAppValue(
    "isError",
    "isLoading",
    "project.name",
    "project.isLoading",
  );

  if (appValue.isError) {
    return (
      <div className="center-full">
        <h1 className="mb-4 text-3xl font-bold dark:text-white">
          Can't Load Projects!
        </h1>
        <p className="text-lg dark:text-gray-200">Is the server running?</p>
      </div>
    );
  }

  if (appValue.isLoading || appValue.project.isLoading) {
    return (
      <div className="center-full">
        <Spinner size="xl" color="gray" />
      </div>
    );
  }

  if (!appValue.project) {
    return <NoSelectedProject />;
  }

  return (
    <div className="flex h-[calc(100vh-80px)] flex-row">
      <Thumbnails />
      <SelectedImage />
      <Tagger />
      <ErrorSavingModal />
    </div>
  );
}
