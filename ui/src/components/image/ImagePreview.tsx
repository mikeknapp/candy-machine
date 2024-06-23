import namer from "color-namer";
import { Button } from "flowbite-react";
import React, { memo, useEffect, useRef, useState } from "react";
import { ImageColorPicker } from "react-image-color-picker";
import { API_BASE_URL } from "../../api";
import { imgSize, resizeImage } from "../../models/image";

const MAX_IMG_SIZE = 550;

interface ImagePreviewProps {
  projectName: string;
  filename: string;
}

export const ImagePreview = memo((props: ImagePreviewProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [src, setSrc] = useState("");
  const [colorName, setColorName] = useState("");
  const [clearColorName, setClearColorName] = useState<NodeJS.Timeout | null>(
    null,
  );
  const size = imgSize(props.filename);
  const resized = resizeImage({
    size: size,
    maxHeight: MAX_IMG_SIZE,
    maxWidth: MAX_IMG_SIZE,
  });

  const [imgError, setImgError] = useState(false);

  const loadImg = () => {
    if (!props.projectName || !props.filename) {
      return;
    }

    setImgError(false);

    // Momentarily set to a transparent gif to hide the old image.
    setSrc("data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=");

    // Try loading the image.
    const img = new Image();
    img.onload = () => {
      setSrc(img.src);
      setImgError(false);
    };
    img.onerror = () => {
      setImgError(true);
    };
    setSrc(
      `${API_BASE_URL}/project/${props.projectName}/imgs/${props.filename}`,
    );
  };

  useEffect(() => {
    loadImg();
  }, [props.filename, props.projectName]);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const showColorPicker = () => {
      setColorPickerVisible(true);
    };

    const hideColorPicker = () => {
      setColorName("");
      setClearColorName(null);
      setColorPickerVisible(false);
    };

    el.addEventListener("mouseenter", showColorPicker);
    el.addEventListener("mouseleave", hideColorPicker);

    return () => {
      el.removeEventListener("mouseenter", showColorPicker);
      el.removeEventListener("mouseleave", hideColorPicker);
    };
  }, [ref]);

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

      <div
        ref={ref}
        className={`relative flex flex-col rounded-md ${imgError ? "hidden" : ""}`}
      >
        {src && (
          <div className="relative">
            <img src={src} alt={props.filename} className="h-auto w-full" />
            {colorPickerVisible && (
              <div className="absolute inset-0">
                <ImageColorPicker
                  onColorPick={(rgb) => {
                    if (clearColorName) {
                      clearTimeout(clearColorName);
                    }
                    const names = namer(rgb);
                    const pantone = names.pantone[0].name;
                    const x11 = names.x11[0].name;
                    setColorName(
                      `${x11.toUpperCase()} | ${pantone.toUpperCase()}`,
                    );
                    setClearColorName(
                      setTimeout(() => {
                        setColorName("");
                      }, 3000),
                    );
                  }}
                  imgSrc={src}
                  zoom={1}
                />
              </div>
            )}
            {colorName && (
              <span className="absolute right-14 top-3 z-50 whitespace-nowrap rounded-md bg-black p-2 text-center text-sm text-white">
                {colorName}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
