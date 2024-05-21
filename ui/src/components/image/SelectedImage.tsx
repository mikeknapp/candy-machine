import React from "react";
import { API_BASE_URL } from "../../api";
import { Project } from "../../models/project";
import { QuickActions } from "../project/QuickActions";

export function SelectedImage({ project }: { project: Project }) {
  return (
    <div className="flex w-1/4 flex-col justify-start gap-5 p-5">
      <QuickActions project={project} />

      <div className="flex flex-row justify-center">
        <img
          src={`${API_BASE_URL}/project/${project.name}/imgs/${project.selectedImage}`}
          className="aspect-auto max-h-[700px] w-auto rounded-md shadow-md"
          alt="Preview"
        />
      </div>

      <div className="rounded-md bg-yellow-50 p-1 font-mono text-sm font-bold dark:bg-slate-900 dark:text-blue-500 md:p-6 md:text-base">
        photo of a person, eating an apple, sitting on a beach, park, flowers,
        reading newspaper, birds, daytime
      </div>
    </div>
  );
}
