import React from "react";
import { TagCategory } from "./TagCategory";

import { useRecoilValue } from "recoil";
import { tagLayoutSelector } from "../../state/atoms";
import { ProjectCategoriesModal } from "./ProjectCategoriesModal";
import "./tags.css";

export function Tagger() {
  const tagLayout = useRecoilValue(tagLayoutSelector);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-pink-100 py-10 pl-10 dark:bg-slate-900">
      <div className="flex h-full w-full flex-col !overflow-y-auto">
        {tagLayout.map((category, i) => (
          <TagCategory key={category.title} category={category} i={i} />
        ))}
      </div>

      <ProjectCategoriesModal />
    </div>
  );
}
