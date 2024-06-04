import React, { useEffect } from "react";
import { TagCategory } from "./TagCategory";

import { useProjectValue } from "../../hooks/useProject";
import { ProjectCategoriesModal } from "./ProjectCategoriesModal";
import { TagMenu } from "./TagMenu";

export function Tagger() {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const projectValue = useProjectValue();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [projectValue.selectedImage?.filename]);

  if (projectValue.isLoading || !projectValue.selectedImage) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50 py-5 pl-10 dark:bg-slate-900">
      <TagMenu />

      <div
        ref={scrollRef}
        className="flex h-full w-full flex-col !overflow-y-auto"
      >
        {projectValue.tagLayout.map((category) => (
          <TagCategory key={category.title} category={category} />
        ))}
      </div>

      <ProjectCategoriesModal />
    </div>
  );
}
