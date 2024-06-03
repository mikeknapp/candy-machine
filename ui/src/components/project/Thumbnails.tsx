import React, { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import { API_BASE_URL } from "../../api";
import { useProjectState } from "../../hooks/useProject";
import { imgAspectRatio } from "../../models/image";
import { disableKeyboardShortcutsSelector } from "../../state/atoms";
import { ProgressPieChart } from "../nav/ProgressPieChart";

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

  const [projectValue, project] = useProjectState();

  const disableKeyboardShortcuts = useRecoilValue(
    disableKeyboardShortcutsSelector,
  );

  const saveSelectedImage = (img: string) => {
    project.setSelectedImage(img);
    scrollToThumbnail(img);
  };

  // Keyboard navigation.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disableKeyboardShortcuts) return;

      let imgToSelect;
      switch (event.key) {
        case "j":
        case "ArrowDown":
        case "ArrowRight":
          imgToSelect = project.navigateImages("next");
          break;
        case "k":
        case "ArrowUp":
        case "ArrowLeft":
          imgToSelect = project.navigateImages("prev");
      }
      if (imgToSelect) {
        saveSelectedImage(imgToSelect);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [projectValue, disableKeyboardShortcutsSelector]);

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
  }, [projectValue]);

  useEffect(() => {
    // Steal focus away from the project selector so keyboard shortcuts will work immediately.
    // This is hacky, but I couldn't work out how to do this otherwise.
    const focusStealer = document.getElementById("focus-stealer");
    focusStealer?.focus();
    setTimeout(() => {
      focusStealer?.blur();
      scrollToThumbnail(projectValue.selectedImage?.filename);
    }, 100);
  }, [projectValue]);

  return (
    <>
      <button
        id="focus-stealer"
        className="fixed left-0 top-0 h-[1px] w-[1px] bg-transparent focus:outline-none"
      />

      <div
        className={`flex h-full w-[${CONTAINER_WIDTH}] min-w-[125px] flex-col gap-4 overflow-y-auto bg-slate-800 p-4 pb-20 scrollbar-thin dark:bg-slate-900`}
      >
        {projectValue.images.map((img, index) => (
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
            className={`cursor-pointer rounded-md bg-gray-500 shadow-md ${projectValue.selectedImage?.filename != img ? "opacity-30 hover:border-white hover:opacity-70 " : "border-primary-600"}`}
            data-src={`${API_BASE_URL}/project/${projectValue.name}/imgs/${img}?thumbnail=true`}
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt={img}
            onClick={() => saveSelectedImage(img)}
          />
        ))}
        <div className="absolute bottom-3 left-3">
          <ProgressPieChart />
        </div>
      </div>
    </>
  );
}
