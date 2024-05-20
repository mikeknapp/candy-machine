import { Button, ButtonGroup } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { HiArrowLeft, HiArrowRight, HiMiniTrash } from "react-icons/hi2";
import { MdCropRotate } from "react-icons/md";
import { useRecoilState } from "recoil";
import Project from "../../models/project";
import { selectedImageAtom, showCropImageModalAtom } from "../../state/atoms";
import { CropImageModal } from "../image/CropImageModal";
import { DeleteImageModal } from "../image/DeleteImageModal";
import { scrollToThumbnail } from "./Thumbnails";

export function QuickActions({ project }: { project: Project }) {
  const [selectedImg, setSelectedImg] = useRecoilState(selectedImageAtom);
  const [editImageModalIsOpen, setShowEditImageModal] = useRecoilState(
    showCropImageModalAtom,
  );

  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);

  const selectNewImage = (img: string) => {
    setSelectedImg(img);
    scrollToThumbnail(img);
  };

  const navigateImages = (direction: "next" | "previous") => {
    let imgToSelect = project.navigateImages(selectedImg, direction);
    if (imgToSelect) {
      selectNewImage(imgToSelect);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (editImageModalIsOpen || showDeleteImageModal) return;

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
  }, [editImageModalIsOpen]);

  return (
    <div className="flex flex-row justify-center">
      <ButtonGroup>
        <Button
          size="xl"
          disabled={!project.navigateImages(selectedImg, "previous")}
          color="light"
          title="Prev Image [⬆️⬅️]"
          onClick={() => navigateImages("previous")}
        >
          <HiArrowLeft />
        </Button>
        <Button
          size="xl"
          color="light"
          title="Crop / Rotate Image [c]"
          onClick={() => setShowEditImageModal(true)}
        >
          <MdCropRotate />
        </Button>
        <Button
          size="xl"
          color="light"
          title="Delete Image [x]"
          onClick={() => setShowDeleteImageModal(true)}
        >
          <HiMiniTrash />
        </Button>
        <Button
          size="xl"
          disabled={!project.navigateImages(selectedImg, "next")}
          color="light"
          title="Next Image [⬇️➡️]"
          onClick={() => navigateImages("next")}
        >
          <HiArrowRight />
        </Button>
      </ButtonGroup>

      <CropImageModal project={project} />

      <DeleteImageModal
        project={project}
        selectedImg={selectedImg}
        show={showDeleteImageModal}
        onClose={() => setShowDeleteImageModal(false)}
      />
    </div>
  );
}
