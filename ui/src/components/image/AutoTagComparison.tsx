import React from "react";
import { SelectedImage } from "../../models/image";

export function AutoTagComparison({
  selectedImage,
}: {
  selectedImage: SelectedImage;
}) {
  return (
    <>
      {selectedImage?.autoTags?.map((tag, i) => {
        return (
          <span key={`auto-tag-${i}`}>
            {selectedImage?.tags?.includes(tag) ? (
              <span className="font-normal text-gray-500">{tag}</span>
            ) : (
              <span className="text-red-500">{tag}</span>
            )}
            {i < selectedImage?.autoTags?.length - 1 ? ", " : ""}
          </span>
        );
      })}
    </>
  );
}
