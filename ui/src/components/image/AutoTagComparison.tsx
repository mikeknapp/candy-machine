import React from "react";
import { SelectedImageTags } from "../../models/project";

export function AutoTagComparison({ imgTags }: { imgTags: SelectedImageTags }) {
  return (
    <>
      {imgTags.autoTags.map((tag, i) => {
        return (
          <>
            {imgTags.selected.includes(tag) ? (
              <span className="font-normal text-gray-500">{tag}</span>
            ) : (
              <span className="text-red-500">{tag}</span>
            )}
            {i < imgTags.autoTags.length - 1 ? ", " : ""}
          </>
        );
      })}
    </>
  );
}
