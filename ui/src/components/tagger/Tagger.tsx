import React, { useEffect, useRef } from "react";
import { TagCategory } from "./TagCategory";

import { useAppValue } from "../../hooks/useApp";
import { ProjectCategoriesModal } from "./ProjectCategoriesModal";
import { TagMenu } from "./TagMenu";

export function Tagger() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const appValue = useAppValue(
    "project.selectedImage",
    "project.tagLayout",
    "project.isLoading",
  );
  const selectedImage = appValue.project.selectedImage;
  const filename = selectedImage?.filename;
  const isLoading = selectedImage?.isLoading;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [filename]);

  if (appValue.project.isLoading || !selectedImage) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50 py-5 pl-10 dark:bg-slate-900">
      <TagMenu />

      <div
        ref={scrollRef}
        className={`flex h-full w-full flex-col ${isLoading ? "" : "!overflow-y-auto"}`}
      >
        {appValue.project.tagLayout.map((category) => (
          <TagCategory key={category.title} category={category} />
        ))}

        {appValue.project.selectedImage?.uncategorizedTags.length > 0 && (
          <TagCategory
            key="non-standard"
            category={{
              title: "Uncategorized",
              tags: appValue.project.selectedImage?.uncategorizedTags,
              color: "#ccc",
              hideAddButton: true,
            }}
          />
        )}
      </div>

      <ProjectCategoriesModal />
    </div>
  );
}
