import React from "react";
import { TagCategory } from "./TagCategory";

import { useRecoilValue, useRecoilValueLoadable } from "recoil";
import { Project } from "../../models/project";
import { currentProjectSelector, tagLayoutSelector } from "../../state/atoms";
import { ProjectCategoriesModal } from "./ProjectCategoriesModal";
import { TagMenu } from "./TagMenu";

export function Tagger() {
  const tagLayout = useRecoilValue(tagLayoutSelector);
  const projectLoading = useRecoilValueLoadable(currentProjectSelector);

  if (projectLoading.state === "loading") {
    return null;
  }

  const project = projectLoading.contents as Project;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50 py-5 pl-10 dark:bg-slate-900">
      <TagMenu project={project} />

      <div className="flex h-full w-full flex-col !overflow-y-auto">
        {tagLayout.map((category, i) => (
          <TagCategory key={category.title} category={category} />
        ))}
      </div>

      <ProjectCategoriesModal />
    </div>
  );
}
