import { Button, Tooltip } from "flowbite-react";
import React, { memo, useContext, useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCropSimple,
  FaRegTrashCan,
} from "react-icons/fa6";
import { AppContext } from "../../app";
import { useShortcut } from "../../hooks/useShortcut";
import { scrollToThumbnail } from "../project/Thumbnails";
import { DeleteImageModal } from "./DeleteImageModal";
import { EditImageModal } from "./EditImageModal";

interface QuickActionsProps {
  projectName: string;
  filename: string;
}

export const QuickActions = memo((props: QuickActionsProps) => {
  const app = useContext(AppContext);
  const hasSelectedImage = Boolean(props.filename);

  const [showEditImageModal, setShowEditImageModal] = useState(false);
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);

  const navigate = (direction: "next" | "prev") => {
    let img = app.project.navigateImages(direction);
    if (img) {
      app.project.setSelectedImage(img);
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
            disabled={!app.project.navigateImages("prev")}
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
            disabled={!app.project.navigateImages("next")}
            color="light"
            onClick={() => navigate("next")}
            className="rounded-l-none"
          >
            <FaArrowRight />
          </Button>
        </Tooltip>
      </div>

      <EditImageModal
        projectName={props.projectName}
        filename={props.filename}
        show={showEditImageModal}
        onClose={() => setShowEditImageModal(false)}
      />

      <DeleteImageModal
        filename={props.filename}
        show={showDeleteImageModal}
        onClose={() => setShowDeleteImageModal(false)}
      />
    </div>
  );
});
