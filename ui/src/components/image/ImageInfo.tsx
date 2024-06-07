import { Tooltip } from "flowbite-react";
import React, { memo } from "react";
import { FaCheck } from "react-icons/fa6";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { imgSize } from "../../models/image";

export const ImageInfo = memo(({ filename }: { filename: string }) => {
  const size = imgSize(filename);
  const isSmallImage = size.width < 1024 && size.height < 1024;

  return (
    <div
      className={`flex w-[90%] flex-row items-center justify-center gap-3 rounded-md px-1 text-center font-mono text-sm text-gray-500 dark:bg-slate-900 dark:text-teal-400 md:px-4 md:py-2 md:text-base ${isSmallImage ? "bg-orange-50" : "bg-green-50"}`}
    >
      <span className="text-sm font-bold">
        {filename}: {size.width} x {size.height}
      </span>

      {isSmallImage ? (
        <Tooltip content="Image is smaller than 1024x1024, but may still be fine">
          <TbAlertTriangleFilled className="pointer text-xl text-orange-500" />
        </Tooltip>
      ) : (
        <Tooltip content="Image is larger than 1024x1024">
          <FaCheck className="pointer text-xl text-green-500" />
        </Tooltip>
      )}
    </div>
  );
});
