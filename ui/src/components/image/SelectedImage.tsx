import { Tooltip } from "flowbite-react";
import React from "react";
import { FaCheck } from "react-icons/fa";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";
import { API_BASE_URL } from "../../api";
import { imgSize } from "../../models/image";
import { previewTagTextFile } from "../../models/project";
import {
  currentProjectSelector,
  selectedTagsSelector,
} from "../../state/atoms";
import { QuickActions } from "./QuickActions";

export function SelectedImage() {
  const project = useRecoilValue(currentProjectSelector);
  const selectedTagsLoadable = useRecoilValueLoadable(
    selectedTagsSelector({
      projectName: project.name,
      image: project.selectedImage,
    }),
  );

  let tagsTextFile = null;
  if (selectedTagsLoadable.state === "hasValue") {
    let selectedTags = selectedTagsLoadable.contents as string[];
    tagsTextFile = previewTagTextFile(project, selectedTags);
  }
  const size = imgSize(project.selectedImage);

  return (
    <div className="flex w-1/4 min-w-[700px] flex-col justify-start gap-5 p-5">
      {project.selectedImage && (
        <>
          {/* Quick actions menu (next image, crop, delete etc) */}
          <QuickActions project={project} />

          {/* Image preview */}
          <div className="flex flex-row justify-center">
            <img
              src={`${API_BASE_URL}/project/${project.name}/imgs/${project.selectedImage}`}
              className="aspect-auto max-h-[700px] w-auto rounded-md shadow-md"
              alt="Preview"
            />
          </div>

          {/* Image information */}
          <div className="flex flex-row items-center justify-center gap-3 rounded-md bg-green-50 px-1 text-center font-mono text-sm dark:bg-slate-900 dark:text-blue-500 md:px-4 md:py-2 md:text-base">
            <span className="text-sm font-bold">{project.selectedImage}:</span>{" "}
            {size.width} x {size.height}
            {size.width >= 1024 || size.height >= 1024 ? (
              <Tooltip content="Image is larger than 1024x1024">
                <FaCheck className="pointer text-xl text-green-500" />
              </Tooltip>
            ) : (
              <Tooltip content="Image is smaller than 1024x1024, but may still be fine">
                <TbAlertTriangleFilled className="pointer text-xl text-orange-500" />
              </Tooltip>
            )}
          </div>

          {/* Tags .txt file preview */}
          {tagsTextFile && (
            <div className="rounded-md bg-yellow-50 p-1 font-mono text-sm font-bold dark:bg-slate-900 dark:text-blue-500 md:p-6 md:text-base">
              {tagsTextFile}
            </div>
          )}
        </>
      )}
    </div>
  );
}
