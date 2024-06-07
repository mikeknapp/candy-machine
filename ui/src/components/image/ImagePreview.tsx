import React, { memo, useEffect, useRef } from "react";
import { API_BASE_URL } from "../../api";
import { imgSize, resizeImage } from "../../models/image";

const MAX_IMG_SIZE = 550;

interface ImagePreviewProps {
  projectName: string;
  filename: string;
}

export const ImagePreview = memo((props: ImagePreviewProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const size = imgSize(props.filename);
  const resized = resizeImage({
    size: size,
    maxHeight: MAX_IMG_SIZE,
    maxWidth: MAX_IMG_SIZE,
  });

  useEffect(() => {
    if (!props.projectName || !props.filename) {
      return;
    }
    // Momentarily set to a transparent gif to hide the old image.
    imgRef.current.src =
      "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    setTimeout(() => {
      imgRef.current.src = `${API_BASE_URL}/project/${props.projectName}/imgs/${props.filename}`;
    }, 0);
  }, [props.filename, props.projectName]);

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
});
