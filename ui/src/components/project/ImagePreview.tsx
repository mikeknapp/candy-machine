import { Button, ButtonGroup } from "flowbite-react";
import React from "react";
import { HiArrowLeft, HiArrowRight, HiMiniTrash } from "react-icons/hi2";
import { MdCropRotate } from "react-icons/md";
import { useRecoilState } from "recoil";
import { API_BASE_URL } from "../../api";
import Project from "../../models/project";
import { selectedImageAtom } from "../../state/atoms";
import { scrollToThumbnail } from "./ImageThumbnails";

export function ImagePreview({ project }: { project: Project }) {
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
    <div className="flex w-1/4 flex-col justify-start gap-5 p-5">
      <div className="flex flex-row justify-center">
        <ButtonGroup>
          <Button
            size="xl"
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
            gradientDuoTone="pinkToOrange"
            title="Next Image [⬇️ or ➡️ arrow]"
            onClick={() => navigateImages("next")}
          >
            <HiArrowRight />
          </Button>
        </ButtonGroup>
      </div>

      <div className="flex flex-row justify-center">
        <img
          src={`${API_BASE_URL}/project/${project.dirName}/imgs/${selectedImg}`}
          className="aspect-auto max-h-[700px] w-auto rounded-md shadow-md"
          alt="Preview"
        />
      </div>

      <div className="rounded-md bg-yellow-50 p-1 font-mono text-sm font-bold dark:bg-slate-900 dark:text-blue-500 md:p-6 md:text-base">
        photo of a person, eating an apple, sitting on a beach, park, flowers,
        reading newspaper, birds, daytime
      </div>
    </div>
  );
}
