import { Button } from "flowbite-react";
import React, { memo, useEffect, useRef, useState } from "react";
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

  const [imgError, setImgError] = useState(false);

  const loadImg = () => {
    if (!props.projectName || !props.filename || !imgRef.current) {
      return;
    }

    setImgError(false);

    // Momentarily set to a transparent gif to hide the old image.
    imgRef.current.src =
      "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

    // Try loading the image.
    const img = new Image();
    img.onload = () => {
      if (imgRef.current) {
        imgRef.current.src = img.src;
        setImgError(false);
      }
    };
    img.onerror = () => {
      setImgError(true);
    };
    img.src = `${API_BASE_URL}/project/${props.projectName}/imgs/${props.filename}`;
  };

  useEffect(() => {
    loadImg();
  }, [props.filename, props.projectName]);

  return (
    <div
      className="flex rounded-md bg-slate-200 shadow-md"
      style={{
        width: `${resized.width}px`,
        height: `${resized.height}px`,
      }}
    >
      {imgError && (
        <div className="flex flex-grow flex-col items-center justify-center gap-2">
          <p className="font-bold">Error Loading Image</p>
          <Button onClick={() => loadImg()} color="light">
            Try Again
          </Button>
        </div>
      )}
      <img
        ref={imgRef}
        style={{
          width: `${resized.width}px`,
          height: `${resized.height}px`,
        }}
        src=""
        alt="Image Preview"
        className={`rounded-md ${imgError ? "hidden" : ""}`}
      />
    </div>
  );
});
