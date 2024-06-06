import React, { useEffect, useRef } from "react";
import { useProjectValue } from "../../hooks/useProject";
import { imgSize } from "../../models/image";
import { AutoTagPreview } from "./AutoTagPreview";
import { ImageInfo } from "./ImageInfo";
import { ImagePreview } from "./ImagePreview";
import { QuickActions } from "./QuickActions";
import { TxtFilePreview } from "./TxtFilePreview";

export function SelectedImage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const projectValue = useProjectValue();
  const selectedImage = projectValue?.selectedImage;
  const filename = selectedImage?.filename;
  const size = imgSize(filename);

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
          <QuickActions projectValue={projectValue} />
          <ImagePreview projectValue={projectValue} size={size} />
          <ImageInfo image={selectedImage} size={size} />
          <TxtFilePreview projectValue={projectValue} />
          <AutoTagPreview projectValue={projectValue} />
        </>
      )}
    </div>
  );
}
