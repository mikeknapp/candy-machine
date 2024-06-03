import { Button, Tooltip } from "flowbite-react";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCropSimple,
  FaRegTrashCan,
} from "react-icons/fa6";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useProject } from "../../hooks/useProject";
import {
  disableKeyboardShortcutsSelector,
  showCropImageModalAtom,
} from "../../state/atoms";
import { scrollToThumbnail } from "../project/Thumbnails";
import { CropImageModal } from "./CropImageModal";
import { DeleteImageModal } from "./DeleteImageModal";

export function QuickActions() {
  const [project, projectContext] = useProject();

  const setShowEditImageModal = useSetRecoilState(showCropImageModalAtom);
  const disableKeyboardShortcuts = useRecoilValue(
    disableKeyboardShortcutsSelector,
  );

  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);

  const navigate = (direction: "next" | "prev") => {
    let img = projectContext.navigateImages(direction);
    if (img) {
      projectContext.setSelectedImage(img);
      scrollToThumbnail(img);
    }
  };

  // Shortcut listener.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disableKeyboardShortcuts || showDeleteImageModal) return;

      switch (event.key) {
        case "e":
          setShowEditImageModal(true);
          break;
        case "Delete":
        case "d":
          setShowDeleteImageModal(true);
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [disableKeyboardShortcuts, showDeleteImageModal]);

  return (
    <div className="flex flex-row justify-center">
      <div className="flex flex-row">
        <Tooltip content="Prev Image [⬆️,⬅️,j]">
          <Button
            size="xl"
            disabled={!projectContext.navigateImages("prev")}
            color="light"
            onClick={() => navigate("prev")}
            className="rounded-r-none border-r-0"
          >
            <FaArrowLeft />
          </Button>
        </Tooltip>
        <Tooltip content="Edit Image (Crop / Rotate) [e]">
          <Button
            size="xl"
            color="light"
            onClick={() => setShowEditImageModal(true)}
            className="rounded-none border-r-0"
          >
            <FaCropSimple />
          </Button>
        </Tooltip>
        <Tooltip content="Delete Image [d]">
          <Button
            size="xl"
            color="light"
            onClick={() => setShowDeleteImageModal(true)}
            className="rounded-none border-r-0"
          >
            <FaRegTrashCan />
          </Button>
        </Tooltip>
        <Tooltip content="Next Image [⬇️,➡️,k]">
          <Button
            size="xl"
            disabled={!projectContext.navigateImages("next")}
            color="light"
            onClick={() => navigate("next")}
            className="rounded-l-none"
          >
            <FaArrowRight />
          </Button>
        </Tooltip>
      </div>

      <CropImageModal />

      {project && (
        <DeleteImageModal
          selectedImg={project.selectedImage?.filename}
          show={showDeleteImageModal}
          onClose={() => setShowDeleteImageModal(false)}
        />
      )}
    </div>
  );
}
