import React, { useEffect, useRef } from "react";
import { API_BASE_URL } from "../../api";
import { useAppState } from "../../hooks/useApp";
import { useShortcut } from "../../hooks/useShortcut";
import { imgAspectRatio } from "../../models/image";
import { ProgressPieChart } from "../layout/ProgressPieChart";

const BORDER_WIDTH = 4;
const CONTAINER_WIDTH = 300;
const THUMBNAIL_WIDTH = CONTAINER_WIDTH - BORDER_WIDTH * 2;

export const scrollToThumbnail = (img: string) => {
  if (img === "") return;
  const EXTRA_PADDING = 100;
  const imgElement = document.getElementById(`thumb-img-${img}`);
  const parentNode = imgElement?.parentNode as HTMLElement;
  if (imgElement) {
    // Scroll to the image.
    parentNode.scrollTop =
      imgElement.offsetTop -
      parentNode.getBoundingClientRect().height / 2 +
      EXTRA_PADDING;
  }
};

export function Thumbnails() {
  const observer = useRef<IntersectionObserver | null>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [appValue, app] = useAppState(
    "project.name",
    "project.images",
    "project.selectedImage.filename",
  );

  const projectName = appValue.project.name;
  const images = appValue.project.images;
  const filename = appValue.project.selectedImage?.filename;

  const moveToImage = (mode: "next" | "prev" | "filename", img = "") => {
    if (mode === "next" || mode === "prev") {
      img = app.project.navigateImages(mode);
    }
    if (img) {
      app.project.setSelectedImage(img);
      scrollToThumbnail(img);
    }
  };

  useShortcut({
    description: "Next Image",
    keys: ["j", "ArrowDown", "ArrowRight"],
    onKeyDown: () => moveToImage("next"),
    deps: [],
  });

  useShortcut({
    description: "Previous Image",
    keys: ["k", "ArrowUp", "ArrowLeft"],
    onKeyDown: () => moveToImage("prev"),
    deps: [],
  });

  // Lazy load the thumbnails.
  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            // Add a delay before loading the image
            setTimeout(() => {
              // Check if the image is still in the viewport
              if (entry.isIntersecting && img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
              }
            }, 500); // 500 ms delay
          }
        }
      });
    });

    imgRefs.current.forEach((img) => img && observer.current?.observe(img));

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [projectName]);

  useEffect(() => {
    // Steal focus away from the project selector so keyboard shortcuts will work immediately.
    // This is hacky, but I couldn't work out how to do this otherwise.
    const focusStealer = document.getElementById("focus-stealer");
    focusStealer?.focus();
    setTimeout(() => {
      focusStealer?.blur();
      scrollToThumbnail(filename);
    }, 100);
  }, [projectName]);

  return (
    <>
      <button
        id="focus-stealer"
        className="fixed left-0 top-0 h-[1px] w-[1px] bg-transparent focus:outline-none"
      />

      <div
        className={`flex h-full w-[${CONTAINER_WIDTH}] min-w-[125px] flex-col gap-4 overflow-y-auto bg-slate-800 p-4 pb-20 scrollbar-thin dark:bg-slate-900`}
      >
        {images.map((img, index) => (
          <img
            ref={(el) => (imgRefs.current[index] = el)}
            key={img}
            id={`thumb-img-${img}`}
            style={{
              width: `${THUMBNAIL_WIDTH + BORDER_WIDTH}px`,
              height: "auto",
              aspectRatio: imgAspectRatio(img),
              borderWidth: `${BORDER_WIDTH}px`,
            }}
            className={`cursor-pointer rounded-md bg-gray-500 shadow-md ${filename != img ? "opacity-30 hover:border-white hover:opacity-70 " : "border-primary-600"}`}
            data-src={`${API_BASE_URL}/project/${projectName}/imgs/${img}?thumbnail=true`}
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt={img}
            onClick={() => moveToImage("filename", img)}
          />
        ))}
        <div className="absolute bottom-3 left-3">
          <ProgressPieChart />
        </div>
      </div>
    </>
  );
}
