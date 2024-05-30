import { Button } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { HiArrowLeft, HiArrowRight, HiMiniTrash } from "react-icons/hi2";
import { MdCropRotate } from "react-icons/md";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Project, navigateImages } from "../../models/project";
import {
  currentProjectSelector,
  disableKeyboardShortcutsSelector,
  showCropImageModalAtom,
} from "../../state/atoms";
import { scrollToThumbnail } from "../project/Thumbnails";
import { CropImageModal } from "./CropImageModal";
import { DeleteImageModal } from "./DeleteImageModal";

export function QuickActions({ project }: { project: Project }) {
  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectSelector,
  );
  const setShowEditImageModal = useSetRecoilState(showCropImageModalAtom);
  const disableKeyboardShortcuts = useRecoilValue(
    disableKeyboardShortcutsSelector,
  );

  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);

  const navigate = (direction: "next" | "prev") => {
    let img = navigateImages(project, direction);
    if (img) {
      setCurrentProject({ ...currentProject, selectedImage: img });
      scrollToThumbnail(img);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disableKeyboardShortcuts || showDeleteImageModal) return;

      switch (event.key) {
        case "c":
          setShowEditImageModal(true);
          break;
        case "Delete":
        case "x":
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
      <div className="flex flex-row rounded-lg">
        <Button
          size="xl"
          disabled={!navigateImages(project, "prev")}
          color="light"
          title="Prev Image [⬆️⬅️]"
          onClick={() => navigate("prev")}
          className="rounded-r-none border-r-0"
        >
          <HiArrowLeft />
        </Button>
        <Button
          size="xl"
          color="light"
          title="Crop / Rotate Image [c]"
          onClick={() => setShowEditImageModal(true)}
          className="rounded-none border-r-0"
        >
          <MdCropRotate />
        </Button>
        <Button
          size="xl"
          color="light"
          title="Delete Image [x]"
          onClick={() => setShowDeleteImageModal(true)}
          className="rounded-none border-r-0"
        >
          <HiMiniTrash />
        </Button>
        <Button
          size="xl"
          disabled={!navigateImages(project, "next")}
          color="light"
          title="Next Image [⬇️➡️]"
          onClick={() => navigate("next")}
          className="rounded-l-none"
        >
          <HiArrowRight />
        </Button>
      </div>

      <CropImageModal />

      <DeleteImageModal
        project={project}
        selectedImg={project.selectedImage}
        show={showDeleteImageModal}
        onClose={() => setShowDeleteImageModal(false)}
      />
    </div>
  );
}
