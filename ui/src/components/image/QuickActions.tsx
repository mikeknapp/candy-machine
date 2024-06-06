import { Button, Tooltip } from "flowbite-react";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCropSimple,
  FaRegTrashCan,
} from "react-icons/fa6";
import { useApp } from "../../hooks/useApp";
import { useProject } from "../../hooks/useProject";
import { useShortcut } from "../../hooks/useShortcut";
import { ProjectData } from "../../models/project";
import { scrollToThumbnail } from "../project/Thumbnails";
import { DeleteImageModal } from "./DeleteImageModal";
import { EditImageModal } from "./EditImageModal";

export function QuickActions({ projectValue }: { projectValue: ProjectData }) {
  const app = useApp();
  const project = useProject();
  const hasSelectedImage = Boolean(projectValue.selectedImage?.filename);

  const [showEditImageModal, setShowEditImageModal] = useState(false);
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);

  const navigate = (direction: "next" | "prev") => {
    let img = project.navigateImages(direction);
    if (img) {
      project.setSelectedImage(img);
      scrollToThumbnail(img);
    }
  };

  useShortcut({
    description: "Edit Image (Crop, Rotate etc)",
    keys: "e",
    onKeyDown: () => hasSelectedImage && setShowEditImageModal(true),
    deps: [hasSelectedImage],
  });

  useShortcut({
    description: "Delete Image",
    keys: "d",
    onKeyDown: () => hasSelectedImage && setShowDeleteImageModal(true),
    deps: [hasSelectedImage],
  });

  useEffect(() => {
    app.disableKeyboardShortcuts = showEditImageModal || showDeleteImageModal;
  }, [showEditImageModal, showDeleteImageModal]);

  return (
    <div className="flex flex-row justify-center">
      <div className="flex flex-row">
        <Tooltip content="Prev Image [⬆️,⬅️,j]">
          <Button
            size="xl"
            disabled={!project.navigateImages("prev")}
            color="light"
            onClick={() => navigate("prev")}
            className="rounded-r-none border-r-0"
          >
            <FaArrowLeft />
          </Button>
        </Tooltip>
        <Tooltip content="Edit Image [e]">
          <Button
            size="xl"
            color="light"
            onClick={() => hasSelectedImage && setShowEditImageModal(true)}
            className="rounded-none border-r-0"
          >
            <FaCropSimple />
          </Button>
        </Tooltip>
        <Tooltip content="Delete Image [d]">
          <Button
            size="xl"
            color="light"
            onClick={() => hasSelectedImage && setShowDeleteImageModal(true)}
            className="rounded-none border-r-0"
          >
            <FaRegTrashCan />
          </Button>
        </Tooltip>
        <Tooltip content="Next Image [⬇️,➡️,k]">
          <Button
            size="xl"
            disabled={!project.navigateImages("next")}
            color="light"
            onClick={() => navigate("next")}
            className="rounded-l-none"
          >
            <FaArrowRight />
          </Button>
        </Tooltip>
      </div>

      <EditImageModal
        show={showEditImageModal}
        onClose={() => setShowEditImageModal(false)}
      />

      <DeleteImageModal
        selectedImg={projectValue.selectedImage?.filename}
        show={showDeleteImageModal}
        onClose={() => setShowDeleteImageModal(false)}
      />
    </div>
  );
}
