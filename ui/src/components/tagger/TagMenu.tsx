import { Button, Tooltip } from "flowbite-react";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { FaPencil, FaWandMagicSparkles } from "react-icons/fa6";
import { useProjectState } from "../../hooks/useProject";
import { useShortcut } from "../../hooks/useShortcut";
import { ClearTagsModal } from "./ClearTagsModal";
import { TagSearch } from "./TagSearch";

export function TagMenu() {
  const [projectValue, project] = useProjectState();
  const img = projectValue.selectedImage;
  const imgTagsLoaded = img?.isLoaded ?? false;

  const [showClearTagsModal, setShowClearTagsModal] = useState(false);

  const applyAutoTags = () => {
    project.selectedImage?.applyAutoTags(projectValue.tagLayout);
  };

  const allowShortcuts = !showClearTagsModal || imgTagsLoaded;

  useShortcut({
    // Apply auto tags when the user presses the "a" key.
    keys: "a",
    action: () => allowShortcuts && applyAutoTags(),
    deps: [allowShortcuts],
  });

  useShortcut({
    // Apply auto tags when the user presses the "a" key.
    keys: "x",
    action: () => allowShortcuts && setShowClearTagsModal(true),
    deps: [allowShortcuts],
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
              disabled={!imgTagsLoaded || !img?.autoTags.length}
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
              disabled={!imgTagsLoaded || !img?.tags.length}
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
              disabled={projectValue.isLoading}
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
