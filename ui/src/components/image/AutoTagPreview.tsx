import React from "react";
import { ProjectData } from "../../models/project";
import { AutoTagComparison } from "./AutoTagComparison";

interface AutoTagProps {
  projectValue: ProjectData;
}

export function AutoTagPreview(props: AutoTagProps) {
  const projectValue = props.projectValue;
  const selectedImage = projectValue.selectedImage;
  const hasTags = selectedImage?.autoTags.length > 0;
  const isLoading = !selectedImage?.isLoaded;

  return (
    <>
      {(isLoading || hasTags) && (
        <div className="w-[90%]">
          <div
            className={`min-h-[110px] rounded-md bg-gray-100 p-1 font-mono text-sm font-bold dark:bg-slate-900 dark:text-blue-500 md:px-6 md:pb-6 md:pt-2 md:text-base ${isLoading ? "animate-pulse" : ""}`}
          >
            {hasTags && (
              <>
                <h2 className="my-2 text-center text-sm font-bold text-gray-700">
                  AUTO TAGS (FYI)
                </h2>
                <AutoTagComparison
                  selectedImage={projectValue.selectedImage}
                  synonyms={projectValue.triggerSynonyms}
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
