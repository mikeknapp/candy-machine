import React from "react";
import { Project } from "../../models/project";
import { TagCategory } from "./TagCategory";

import { ProjectCategoriesModal } from "./ProjectCategoriesModal";
import "./tags.css";

export function Tagger({ project }: { project: Project }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-pink-100 py-10 pl-10 dark:bg-slate-900">
      <div className="flex h-full w-full flex-col !overflow-y-auto">
        {project.tagLayout.map((category, i) => (
          <TagCategory key={category.title} category={category} i={i} />
        ))}
      </div>
      <ProjectCategoriesModal project={project} />
    </div>
  );
}
