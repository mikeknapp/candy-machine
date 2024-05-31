import { Button, Spinner, Tooltip } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { FaPencil, FaWandMagicSparkles } from "react-icons/fa6";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";
import { Project } from "../../models/project";
import {
  disableKeyboardShortcutsSelector,
  selectedTagsSelector,
} from "../../state/atoms";
import { ClearTagsModal } from "./ClearTagsModal";

export function TagMenu({ project }: { project: Project }) {
  const [showClearTagsModal, setShowClearTagsModal] = useState(false);

  const disableShortcuts = useRecoilValue(disableKeyboardShortcutsSelector);
  const selectedTagsLoading = useRecoilValueLoadable(
    selectedTagsSelector({
      projectName: project.name,
      image: project.selectedImage,
    }),
  );
  const isLoadingTags = selectedTagsLoading.state === "loading";
  let selectedTags = null;
  if (selectedTagsLoading.state === "hasValue") {
    selectedTags = selectedTagsLoading.contents as string[];
  }

  // Shortcut listener.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disableShortcuts) return;

      switch (event.key) {
        case "a":
          // TODO: Implement tag autofill.
          break;
        case "x":
          setShowClearTagsModal(true);
          break;
        case "l":
          // TODO: Implement tag layout edit.
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [disableShortcuts]);

  return (
    <>
      <div className="mb-5 flex w-full flex-row items-center justify-end pr-10">
        {isLoadingTags && <Spinner className="mr-2" />}
        <Tooltip content="Attempt to fill in tags [a]">
          <Button
            size="xl"
            color="light"
            className="border-r-none rounded-r-none"
            disabled={isLoadingTags}
          >
            <FaWandMagicSparkles />
          </Button>
        </Tooltip>
        <Tooltip content="Clear selected tags from this image [x]">
          <Button
            size="xl"
            color="light"
            className="border-r-none rounded-none"
            disabled={isLoadingTags || !selectedTags?.length}
            onClick={() => setShowClearTagsModal(true)}
          >
            <FaTimes />
          </Button>
        </Tooltip>
        <Tooltip content="Edit this project's tag layout [l]">
          <Button
            size="xl"
            color="light"
            className="rounded-l-none"
            disabled={isLoadingTags}
          >
            <FaPencil />
          </Button>
        </Tooltip>
      </div>

      <ClearTagsModal
        project={project}
        selectedImg={project.selectedImage}
        show={showClearTagsModal}
        onClose={() => setShowClearTagsModal(false)}
      />
    </>
  );
}
