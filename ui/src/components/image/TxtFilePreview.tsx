import React from "react";
import { ProjectData } from "../../models/project";

interface TxtFilePreviewProps {
  projectValue: ProjectData;
}

export function TxtFilePreview(props: TxtFilePreviewProps) {
  const projectValue = props.projectValue;
  const isLoading = !projectValue.selectedImage?.isLoaded;
  const txtPreview = projectValue.selectedImage?.txtFile;

  return (
    <>
      {(isLoading || txtPreview) && (
        <div className="w-[90%]">
          <div
            className={`min-h-[110px] rounded-md bg-gray-100 p-1 font-mono text-sm font-bold text-blue-500 dark:bg-slate-900 md:px-6 md:pb-6 md:pt-2 md:text-base ${isLoading ? "animate-pulse" : ""}`}
          >
            {!isLoading && (
              <>
                <h2 className="my-2 text-center text-sm font-bold text-gray-700">
                  CAPTION .TXT FILE
                </h2>
                {txtPreview}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
