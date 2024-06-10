import { Button, Tooltip } from "flowbite-react";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { FaPencil, FaWandMagicSparkles } from "react-icons/fa6";
import { useAppState } from "../../hooks/useApp";
import { useShortcut } from "../../hooks/useShortcut";
import { ClearTagsModal } from "./ClearTagsModal";
import { TagSearch } from "./TagSearch";

export function TagMenu() {
  const [appValue, app] = useAppState(
    "project.isLoading",
    "project.selectedImage",
    "project.tagLayout",
  );
  const img = appValue.project.selectedImage;
  const imgTagsLoaded = !img?.isLoading ?? false;

  const [showClearTagsModal, setShowClearTagsModal] = useState(false);

  const applyAutoTags = () => {
    app.project.selectedImage?.applyAutoTags(appValue.project.tagLayout);
  };

  const allowShortcuts = !showClearTagsModal || imgTagsLoaded;

  useShortcut({
    description: "Apply Auto Tags",
    keys: "a",
    onKeyDown: () => allowShortcuts && applyAutoTags(),
    deps: [appValue.project, showClearTagsModal, allowShortcuts],
  });

  useShortcut({
    description: "Clear Selected Tags",
    keys: "x",
    onKeyDown: () => allowShortcuts && setShowClearTagsModal(true),
    deps: [appValue.project, showClearTagsModal, allowShortcuts],
  });

  return (
    <>
      <div className="mb-5 flex w-full flex-row items-center justify-between pr-10">
        <TagSearch />

        <div className="flex flex-row items-center">
          <Tooltip content="Attempt to fill in tags [a]">
            <Button
              size="xl"
              color="light"
              className="border-r-none rounded-r-none"
              disabled={!imgTagsLoaded || !img?.autoTags?.length}
              onClick={applyAutoTags}
            >
              <FaWandMagicSparkles />
            </Button>
          </Tooltip>
          <Tooltip content="Clear selected tags from this image [x]">
            <Button
              size="xl"
              color="light"
              className="border-r-none rounded-none"
              disabled={!imgTagsLoaded || !img?.tags?.length}
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
              disabled={appValue.project.isLoading}
            >
              <FaPencil />
            </Button>
          </Tooltip>
        </div>
      </div>

      <ClearTagsModal
        show={showClearTagsModal}
        onClose={() => setShowClearTagsModal(false)}
      />
    </>
  );
}
