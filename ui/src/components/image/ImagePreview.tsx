import React, { useEffect, useRef } from "react";
import { API_BASE_URL } from "../../api";
import { SIZE, resizeImage } from "../../models/image";
import { ProjectData } from "../../models/project";

const MAX_IMG_SIZE = 550;

interface ImagePreviewProps {
  projectValue: ProjectData;
  size: SIZE;
}

export function ImagePreview(props: ImagePreviewProps) {
  const projectName = props.projectValue.name;
  const filename = props.projectValue.selectedImage?.filename;
  const imgRef = useRef<HTMLImageElement>(null);
  const resized = resizeImage({
    size: props.size,
    maxHeight: MAX_IMG_SIZE,
    maxWidth: MAX_IMG_SIZE,
  });

  useEffect(() => {
    if (!projectName || !filename) {
      return;
    }
    // Momentarily set to a transparent gif to hide the old image.
    imgRef.current.src =
      "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    setTimeout(() => {
      imgRef.current.src = `${API_BASE_URL}/project/${projectName}/imgs/${filename}`;
    }, 0);
  }, [filename]);

  return (
    <div
      className="rounded-md bg-slate-200 shadow-md"
      style={{
        width: `${resized.width}px`,
        height: `${resized.height}px`,
      }}
    >
      <img
        ref={imgRef}
        style={{
          width: `${resized.width}px`,
          height: `${resized.height}px`,
        }}
        src=""
        alt="Image Preview"
        className="rounded-md"
      />
    </div>
  );
}
