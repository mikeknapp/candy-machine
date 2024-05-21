import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { API_BASE_URL } from "../../api";
import Project from "../../models/project";
import { selectedImageAtom, showCropImageModalAtom } from "../../state/atoms";
import { ProgressPieChart } from "../nav/ProgressPieChart";

export const scrollToThumbnail = (img: string) => {
  const EXTRA_PADDING = 50;
  const imgElement = document.getElementById(`thumb-img-${img}`);
  const parentNode = imgElement?.parentNode as HTMLElement;
  if (imgElement) {
    // Scroll to the image.
    parentNode.scrollTop =
      imgElement.offsetTop - imgElement.clientHeight - EXTRA_PADDING;
  }
};

export function Thumbnails({ project }: { project: Project }) {
  const [selectedImg, setSelectedImg] = useRecoilState(selectedImageAtom);
  const editImageModalIsOpen = useRecoilValue(showCropImageModalAtom);

  const selectNewImage = (img: string) => {
    setSelectedImg(img);
    scrollToThumbnail(img);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (editImageModalIsOpen) return;

      let imgToSelect;
      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          imgToSelect = project.navigateImages(selectedImg, "next");
          break;
        case "ArrowUp":
        case "ArrowLeft":
          imgToSelect = project.navigateImages(selectedImg, "previous");
      }
      if (imgToSelect) {
        selectNewImage(imgToSelect);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, selectNewImage]);

  return (
    <div className="flex h-full w-[220px] flex-col overflow-y-auto bg-slate-800 pb-20 scrollbar-thin dark:bg-slate-900">
      {project.images.map((img) => (
        <img
          key={img}
          id={`thumb-img-${img}`}
          className={`m-4 cursor-pointer rounded-md border-4 shadow-md ${selectedImg != img ? "opacity-30 hover:border-gray-800" : "border-primary-600"} `}
          src={`${API_BASE_URL}/project/${project.name}/imgs/${img}`}
          alt={img}
          onClick={() => selectNewImage(img)}
        />
      ))}
      <div className="absolute bottom-3 left-3">
        <ProgressPieChart />
      </div>
    </div>
  );
}
