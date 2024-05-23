import React, { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { API_BASE_URL } from "../../api";
import { Project, navigateImages } from "../../models/project";
import {
  currentProjectSelector,
  disableKeyboardShortcutsSelector,
} from "../../state/atoms";
import { ProgressPieChart } from "../nav/ProgressPieChart";

const CONTAINER_WIDTH = 220;
const THUMBNAIL_WIDTH = 170;
const BORDER_WIDTH = 4;

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

export function Thumbnails({ project }: { project: Project }) {
  const observer = useRef<IntersectionObserver | null>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectSelector,
  );
  const disableKeyboardShortcuts = useRecoilValue(
    disableKeyboardShortcutsSelector,
  );

  const selectNewImage = (img: string) => {
    setCurrentProject({ ...currentProject, selectedImage: img });
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
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
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

  const getImageAspectRatio = (img: string) => {
    // Extract the height and width from the image ID i.e. f4227273f1f071f_589x753_0.png
    const matches = img.match(/_(\d+)x(\d+)_/);
    if (!matches) {
      return undefined;
    }
    const width = parseInt(matches[1]);
    const height = parseInt(matches[2]);
    return width / height;
  };

  useEffect(() => {
    // Steal focus away from the project selector so keyboard shortcuts will work immediately.
    // This is hacky, but I couldn't work out how to do this otherwise.
    const focusStealer = document.getElementById("focus-stealer");
    focusStealer?.focus();
    setTimeout(() => {
      focusStealer?.blur();
    }, 100);
  }, [currentProject]);

  return (
    <>
      <button
        id="focus-stealer"
        className="fixed left-0 top-0 h-[1px] w-[1px] bg-transparent focus:outline-none"
      />
      {project.images.length > 0 && (
        <div
          className={`flex h-full w-[${CONTAINER_WIDTH}px] flex-col gap-4 overflow-y-auto bg-slate-800 p-4 pb-20 scrollbar-thin dark:bg-slate-900`}
        >
          {project.images.map((img, index) => (
            <img
              ref={(el) => (imgRefs.current[index] = el)}
              key={img}
              id={`thumb-img-${img}`}
              style={{
                width: `${THUMBNAIL_WIDTH + BORDER_WIDTH}px`,
                height: "auto",
                aspectRatio: getImageAspectRatio(img),
                borderWidth: `${BORDER_WIDTH}px`,
              }}
              className={`cursor-pointer rounded-md bg-gray-500  shadow-md ${project.selectedImage != img ? "opacity-30 hover:border-gray-800" : "border-primary-600"}`}
              data-src={`${API_BASE_URL}/project/${project.name}/imgs/${img}`}
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
