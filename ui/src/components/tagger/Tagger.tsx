import React from "react";
import { Project } from "../../models/project";
import { CategoryData, TagCategory } from "./TagCategory";

import "./tags.css";

const categories: CategoryData[] = [
  {
    title: "media",
    tags: [
      "photo",
      "drawing",
      "illustration",
      "portrait",
      "painting",
      "cartoon",
      "anime",
    ],
    color: "#5311ff",
  },
  {
    title: "subject",
    tags: ["woman", "man", "landscape"],
    color: "#11ffcc",
  },
  {
    title: "clothing",
    tags: ["pants", "dress"],
    color: "#ffccff",
  },
];

export function Tagger({ project }: { project: Project }) {
  return (
    <div className="flex flex-grow flex-col p-10">
      {categories.map((category, i) => (
        <TagCategory key={category.title} category={category} i={i} />
      ))}
    </div>
  );
}
