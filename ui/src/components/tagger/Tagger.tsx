import React, { useEffect, useRef } from "react";
import { TagCategory } from "./TagCategory";

import { useProjectValue } from "../../hooks/useProject";
import { ProjectCategoriesModal } from "./ProjectCategoriesModal";
import { TagMenu } from "./TagMenu";

export function Tagger() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const projectValue = useProjectValue();
  const selectedImage = projectValue.selectedImage;
  const filename = selectedImage?.filename;
  const isLoading = !selectedImage?.isLoaded;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [filename]);

  if (projectValue.isLoading || !selectedImage) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50 py-5 pl-10 dark:bg-slate-900">
      <TagMenu />

      <div
        ref={scrollRef}
        className={`flex h-full w-full flex-col ${isLoading ? "" : "!overflow-y-auto"}`}
      >
        {projectValue.tagLayout.map((category) => (
          <TagCategory key={category.title} category={category} />
        ))}

        {projectValue.selectedImage?.uncategorizedTags.length > 0 && (
          <TagCategory
            key="non-standard"
            category={{
              title: "Uncategorized",
              tags: projectValue.selectedImage?.uncategorizedTags,
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
