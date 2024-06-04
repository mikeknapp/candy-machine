import { Tooltip } from "flowbite-react";
import React, { useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { API_BASE_URL } from "../../api";
import { useProjectValue } from "../../hooks/useProject";
import { imgSize } from "../../models/image";
import { AutoTagComparison } from "./AutoTagComparison";
import { QuickActions } from "./QuickActions";

export function SelectedImage() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const projectValue = useProjectValue();
  const size = imgSize(projectValue?.selectedImage?.filename);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [projectValue.selectedImage]);

  return (
    <div
      ref={scrollRef}
      className="flex w-1/4 min-w-[700px] flex-col justify-start gap-5 overflow-y-auto p-5"
    >
      {projectValue.selectedImage && (
        <>
          {/* Quick actions menu (next image, crop, delete etc) */}
          <QuickActions />

          {/* Image preview */}
          <div className="flex flex-row justify-center">
            <img
              src={`${API_BASE_URL}/project/${projectValue.name}/imgs/${projectValue.selectedImage.filename}`}
              className="aspect-auto max-h-[550px] w-auto max-w-[550px] rounded-md shadow-md"
              alt="Preview"
            />
          </div>

          {/* Image information */}
          <div className="flex flex-row items-center justify-center gap-3 rounded-md bg-green-50 px-1 text-center font-mono text-sm dark:bg-slate-900 dark:text-blue-500 md:px-4 md:py-2 md:text-base">
            <span className="text-sm font-bold">
              {projectValue.selectedImage.filename}:
            </span>{" "}
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
          {projectValue.selectedImage?.txtFile && (
            <>
              <h2 className="text-sm font-bold  text-gray-700 md:mt-2">
                Your Image Tags
              </h2>
              <div className="rounded-md bg-gray-100 p-1 font-mono text-sm font-bold text-blue-500 dark:bg-slate-900 md:p-6 md:text-base">
                {projectValue.selectedImage?.txtFile}
              </div>
            </>
          )}

          {/* Auto tags */}
          {projectValue.selectedImage?.autoTags.length > 0 && (
            <>
              <h2 className="text-sm font-bold text-gray-700 md:mt-2">
                Auto Tags (Not Applied, FYI Only)
              </h2>
              <div className="rounded-md bg-gray-50 p-1 font-mono text-sm font-bold dark:bg-slate-900 dark:text-blue-500 md:p-6 md:text-base">
                <AutoTagComparison selectedImage={projectValue.selectedImage} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
