import React from "react";
import { useAppValue } from "../../hooks/useApp";
import { AutoTagComparison } from "./AutoTagComparison";

export function AutoTagPreview({ isLoading }: { isLoading: boolean }) {
  const appValue = useAppValue(
    "project.selectedImage.filename",
    "project.selectedImage.tags",
    "project.selectedImage.autoTags",
    "project.triggerSynonyms",
  );

  const selectedImage = appValue.project.selectedImage;
  const hasTags = selectedImage.autoTags?.length > 0;

  return (
    <>
      {(isLoading || hasTags) && (
        <div className="w-[90%]">
          <div
            className={`min-h-[110px] rounded-md bg-gray-100 p-1 font-mono text-sm font-bold dark:bg-slate-900 dark:text-lime-500 md:px-6 md:pb-6 md:pt-2 md:text-base ${isLoading ? "animate-pulse" : ""}`}
          >
            {hasTags && (
              <>
                <h2 className="my-2 text-center text-sm font-bold text-gray-700 dark:text-gray-500">
                  AUTO TAGS (FYI)
                </h2>
                <AutoTagComparison
                  filename={selectedImage.filename}
                  tags={selectedImage.tags}
                  autoTags={selectedImage.autoTags}
                  synonyms={appValue.project.triggerSynonyms}
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
