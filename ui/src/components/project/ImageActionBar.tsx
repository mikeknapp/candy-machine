import { Button, ButtonGroup } from "flowbite-react";
import React from "react";
import { HiArrowLeft, HiArrowRight, HiMiniTrash } from "react-icons/hi2";
import { MdCropRotate } from "react-icons/md";
import { useRecoilState, useSetRecoilState } from "recoil";
import Project from "../../models/project";
import { selectedImageAtom, showEditImageModalAtom } from "../../state/atoms";
import { EditImageModal } from "./EditImageModal";
import { scrollToThumbnail } from "./ImageThumbnails";

export function ImageActionBar({ project }: { project: Project }) {
  const [selectedImg, setSelectedImg] = useRecoilState(selectedImageAtom);
  const setShowEditImageModal = useSetRecoilState(showEditImageModalAtom);

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

  return (
    <div className="flex flex-row justify-center">
      <ButtonGroup>
        <Button
          size="xl"
          disabled={!project.navigateImages(selectedImg, "previous")}
          gradientDuoTone="pinkToOrange"
          title="Previous Image [⬆️ or ⬅️ arrow]"
          onClick={() => navigateImages("previous")}
        >
          <HiArrowLeft />
        </Button>
        <Button
          size="xl"
          gradientDuoTone="pinkToOrange"
          title="Crop / Rotate Image [c]"
          onClick={() => setShowEditImageModal(true)}
        >
          <MdCropRotate />
        </Button>
        <Button
          size="xl"
          gradientDuoTone="pinkToOrange"
          title="Delete Image [DEL key]"
        >
          <HiMiniTrash />
        </Button>
        <Button
          size="xl"
          disabled={!project.navigateImages(selectedImg, "next")}
          gradientDuoTone="pinkToOrange"
          title="Next Image [⬇️ or ➡️ arrow]"
          onClick={() => navigateImages("next")}
        >
          <HiArrowRight />
        </Button>
      </ButtonGroup>

      <EditImageModal project={project} />
    </div>
  );
}
