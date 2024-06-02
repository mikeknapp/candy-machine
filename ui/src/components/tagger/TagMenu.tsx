import { Button, Spinner, Tooltip } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { FaPencil, FaWandMagicSparkles } from "react-icons/fa6";
import { useRecoilStateLoadable, useRecoilValue } from "recoil";
import { SelectedImageTags } from "../../models/image";
import { Project_old } from "../../models/project";
import {
  disableKeyboardShortcutsSelector,
  selectedImgTagsSelector,
} from "../../state/atoms";
import { ClearTagsModal } from "./ClearTagsModal";
import { TagSearch } from "./TagSearch";

export function TagMenu({ project }: { project: Project_old }) {
  const [showClearTagsModal, setShowClearTagsModal] = useState(false);

  const disableShortcuts = useRecoilValue(disableKeyboardShortcutsSelector);
  const [selectedTagsLoading, setSelectedTags] = useRecoilStateLoadable(
    selectedImgTagsSelector({
      projectName: project.name,
      image: project.selectedImage,
    }),
  );
  const isLoadingTags = selectedTagsLoading.state === "loading";
  let selectedTags = null;
  if (selectedTagsLoading.state === "hasValue") {
    selectedTags = selectedTagsLoading.contents as SelectedImageTags;
  }

  // Add any tags we found in automatic analysis that aren't already in the list and are in the tag layout.
  // TODO: apply fill-ins!
  const addAutoTags = () => {
    setSelectedTags((prev) => {
      let tags = new Set(prev.selected);
      project.tagLayout.forEach((category) => {
        category.tags.forEach((tag) => {
          if (selectedTags.autoTags.includes(tag)) {
            tags.add(tag);
          }
        });
      });
      return { ...prev, selected: Array.from(tags) };
    });
  };

  // Shortcut listener.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disableShortcuts || showClearTagsModal || isLoadingTags) return;

      switch (event.key) {
        case "a":
          addAutoTags();
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
  }, [disableShortcuts, showClearTagsModal, isLoadingTags]);

  return (
    <>
      <div className="mb-5 flex w-full flex-row items-center justify-between pr-10">
        <TagSearch />

        <div className="flex flex-row items-center">
          {isLoadingTags && <Spinner className="mr-2" />}
          <Tooltip content="Attempt to fill in tags [a]">
            <Button
              size="xl"
              color="light"
              className="border-r-none rounded-r-none"
              disabled={isLoadingTags || selectedTags?.autoTags.length === 0}
              onClick={() => addAutoTags()}
            >
              <FaWandMagicSparkles />
            </Button>
          </Tooltip>
          <Tooltip content="Clear selected tags from this image [x]">
            <Button
              size="xl"
              color="light"
              className="border-r-none rounded-none"
              disabled={isLoadingTags || !selectedTags?.selected.length}
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
