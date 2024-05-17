import { Button, ButtonGroup } from "flowbite-react";
import React from "react";
import { HiArrowLeft, HiArrowRight, HiMiniTrash } from "react-icons/hi2";
import { MdCropRotate } from "react-icons/md";
import { useRecoilState } from "recoil";
import Project from "../../models/project";
import { selectedImageAtom } from "../../state/atoms";
import { scrollToThumbnail } from "./ImageThumbnails";

export function ImageActionBar({ project }: { project: Project }) {
  const [selectedImg, setSelectedImg] = useRecoilState(selectedImageAtom);

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
    </div>
  );
}
