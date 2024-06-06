import React from "react";
import { SelectedImage } from "../../models/image";

export function AutoTagComparison({
  selectedImage,
  synonyms,
}: {
  selectedImage: SelectedImage;
  synonyms: string[];
}) {
  const selected = (selectedImage?.tags ?? []).concat(synonyms);

  return (
    <>
      {selectedImage?.autoTags?.map((tag, i) => {
        return (
          <span key={`auto-tag-${i}`}>
            {selected.includes(tag) ? (
              <span className="font-normal text-green-500">{tag}</span>
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
