import { Tooltip } from "flowbite-react";
import React from "react";
import { FaCheck } from "react-icons/fa6";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { SIZE, SelectedImage } from "../../models/image";

interface ImageInfoProps {
  image: SelectedImage;
  size: SIZE;
}

export function ImageInfo(props: ImageInfoProps) {
  const filename = props.image.filename;
  const smallImg = props.size.width < 1024 && props.size.height < 1024;

  return (
    <div
      className={`flex w-[90%] flex-row items-center justify-center gap-3 rounded-md px-1 text-center font-mono text-sm dark:bg-slate-900 dark:text-blue-500 md:px-4 md:py-2 md:text-base ${smallImg ? "bg-orange-50" : "bg-green-50"}`}
    >
      <span className="text-sm font-bold">{filename}:</span> {props.size.width}{" "}
      x {props.size.height}
      {!smallImg ? (
        <Tooltip content="Image is larger than 1024x1024">
          <FaCheck className="pointer text-xl text-green-500" />
        </Tooltip>
      ) : (
        <Tooltip content="Image is smaller than 1024x1024, but may still be fine">
          <TbAlertTriangleFilled className="pointer text-xl text-orange-500" />
        </Tooltip>
      )}
    </div>
  );
}
