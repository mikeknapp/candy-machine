import React from "react";
import { TagCategory } from "./TagCategory";

import { useRecoilValue } from "recoil";
import { tagLayoutSelector } from "../../state/atoms";
import { ProjectCategoriesModal } from "./ProjectCategoriesModal";

export function Tagger() {
  const tagLayout = useRecoilValue(tagLayoutSelector);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50 py-10 pl-10 dark:bg-slate-900">
      <div className="flex h-full w-full flex-col !overflow-y-auto">
        {tagLayout.map((category, i) => (
          <TagCategory key={category.title} category={category} />
        ))}
      </div>

      <ProjectCategoriesModal />
    </div>
  );
}
