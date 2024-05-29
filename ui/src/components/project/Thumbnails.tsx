import React, { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { API_BASE_URL } from "../../api";
import { imgAspectRatio } from "../../models/image";
import { navigateImages } from "../../models/project";
import {
  currentProjectSelector,
  disableKeyboardShortcutsSelector,
} from "../../state/atoms";
import { ProgressPieChart } from "../nav/ProgressPieChart";

const BORDER_WIDTH = 4;
const CONTAINER_WIDTH = 300;
const THUMBNAIL_WIDTH = CONTAINER_WIDTH - BORDER_WIDTH * 2;

export const scrollToThumbnail = (img: string) => {
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

  const [project, setCurrentProject] = useRecoilState(currentProjectSelector);
  const disableKeyboardShortcuts = useRecoilValue(
    disableKeyboardShortcutsSelector,
  );

  const selectNewImage = (img: string) => {
    setCurrentProject({ ...project, selectedImage: img });
    scrollToThumbnail(img);
  };

  // Keyboard navigation.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disableKeyboardShortcuts) return;

      let imgToSelect;
      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          imgToSelect = navigateImages(project, "next");
          break;
        case "ArrowUp":
        case "ArrowLeft":
          imgToSelect = navigateImages(project, "prev");
      }
      if (imgToSelect) {
        selectNewImage(imgToSelect);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, disableKeyboardShortcutsSelector]);

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
              if (entry.isIntersecting) {
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
  }, [project]);

  useEffect(() => {
    // Steal focus away from the project selector so keyboard shortcuts will work immediately.
    // This is hacky, but I couldn't work out how to do this otherwise.
    const focusStealer = document.getElementById("focus-stealer");
    focusStealer?.focus();
    setTimeout(() => {
      focusStealer?.blur();
      scrollToThumbnail(project.selectedImage);
    }, 100);
  }, [project]);

  return (
    <>
      <button
        id="focus-stealer"
        className="fixed left-0 top-0 h-[1px] w-[1px] bg-transparent focus:outline-none"
      />
      {project.images.length > 0 && (
        <div
          className={`flex h-full w-[${CONTAINER_WIDTH}] min-w-[125px] flex-col gap-4 overflow-y-auto bg-slate-800 p-4 pb-20 scrollbar-thin dark:bg-slate-900`}
        >
          {project.images.map((img, index) => (
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
              className={`cursor-pointer rounded-md bg-gray-500 shadow-md ${project.selectedImage != img ? "opacity-30 hover:border-white hover:opacity-70 " : "border-primary-600"}`}
              data-src={`${API_BASE_URL}/project/${project.name}/imgs/${img}?thumbnail=true`}
              src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
              alt={img}
              onClick={() => selectNewImage(img)}
            />
          ))}
          <div className="absolute bottom-3 left-3">
            <ProgressPieChart />
          </div>
        </div>
      )}
    </>
  );
}
