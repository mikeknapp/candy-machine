import React, { useEffect, useRef } from "react";
import { useAppValue } from "../../hooks/useApp";
import { AutoTagPreview } from "./AutoTagPreview";
import { ImageInfo } from "./ImageInfo";
import { ImagePreview } from "./ImagePreview";
import { QuickActions } from "./QuickActions";
import { TxtFilePreview } from "./TxtFilePreview";

export function SelectedImage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const appValue = useAppValue(
    "project.name",
    "project.selectedImage.filename",
    "project.selectedImage.isLoading",
  );
  const projectName = appValue.project.name;
  const img = appValue.project.selectedImage;
  const filename = img?.filename;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [filename]);

  return (
    <div
      ref={scrollRef}
      className="flex w-1/4 min-w-[700px] flex-col items-center justify-start gap-5 overflow-y-auto p-5"
    >
      {filename && (
        <>
          <QuickActions projectName={projectName} filename={filename} />
          <ImagePreview projectName={projectName} filename={filename} />
          <ImageInfo filename={filename} />
          <TxtFilePreview isLoading={img.isLoading} />
          <AutoTagPreview isLoading={img.isLoading} />
        </>
      )}
    </div>
  );
}
