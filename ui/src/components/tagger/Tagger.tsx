import React from "react";
import { Project } from "../../models/project";
import { CategoryData, TagCategory } from "./TagCategory";

import { ProjectCategoriesModal } from "./ProjectCategoriesModal";
import "./tags.css";

export const CATEGORIES: CategoryData[] = [
  {
    title: "Quality",
    tags: [
      "low quality",
      "high quality",
      "pixelated",
      "blurry",
      "realistic",
      "depth of field",
      "bokeh",
      "motion blur",
    ],
    color: "#ffccff",
  },
  {
    title: "Image Type",
    tags: [
      "photo",
      "drawing",
      "illustration",
      "portrait",
      "painting",
      "render",
      "cartoon",
      "anime",
    ],
    color: "#5311ff",
  },
  {
    title: "Subject",
    tags: [
      "man",
      "woman",
      "mountain",
      "trees",
      "forest",
      "fantasy scene",
      "cityscape",
    ],
    color: "#11ffcc",
  },
  {
    title: "Camera Shot",
    tags: ["full body shot", "medium shot", "close-up", "extreme close-up"],
    color: "#ffccff",
  },
  {
    title: "Perspective",
    tags: [
      "from above",
      "from below",
      "from front",
      "from behind",
      "from side",
      "three-quarters view",
      "rear three-quarters view",
      "overhead",
      "forced perspective",
      "upside down",
    ],
    color: "#ffccff",
  },
  {
    title: "Pose",
    tags: [
      "laying down",
      "sitting",
      "standing",
      "leaning",
      "walking",
      "running",
      "jumping",
      "posing",
      "bent over",
      "head out of frame",
      "squatting",
      "on back",
    ],
    color: "#ffccff",
  },
  {
    title: "Location",
    tags: [
      "indoors",
      "outdoors",
      "street",
      "forest",
      "mountains",
      "beach",
      "park",
      "car",
    ],
    color: "#ffccff",
  },
  {
    title: "Action",
    tags: [
      "posing",
      "lying",
      "reading",
      "writing",
      "talking",
      "singing",
      "dancing",
      "playing",
      "exercising",
      "sleeping",
      "working",
      "relaxing",
    ],
    color: "#ffccff",
  },
  {
    title: "Gaze",
    tags: [
      "looking at viewer",
      "looking up",
      "looking down",
      "looking sideways",
      "looking back",
    ],
    color: "#ffccff",
  },
  {
    title: "Mouth",
    tags: [
      "open mouth",
      "closed mouth",
      "slightly open mouth",
      "smirk",
      "slight smile",
      "smile",
      "grin",
      "laughing",
      "grinning",
      "teeth",
    ],
    color: "#ffccff",
  },
  {
    title: "Hair",
    tags: [
      "long {color} hair",
      "short {color} hair",
      "curly {color} hair",
      "straight {color} hair",
      "bangs",
    ],
    color: "#ffccff",
  },
  {
    title: "Limbs",
    tags: [
      "bent knee",
      "crossed legs",
      "arms raised above head",
      "arms extended sideways",
      "left palm on forehead",
      "right arm on belly",
      "feet",
      "hands",
      "fingers",
      "toes",
    ],
    color: "#ffccff",
  },
  {
    title: "Clothing etc",
    tags: [
      "hat",
      "shirt",
      "necklace",
      "sunglasses",
      "glasses",
      "shoes",
      "dress",
      "pants",
      "sandals",
      "bracelet",
      "earrings",
      "handbag",
      "cellphone",
      "smartphone",
      "barefoot",
      "sneakers",
      "wristwatch",
      "watch",
      "jewelry",
      "ring",
      "loafers",
    ],
    color: "#ffccff",
  },
  {
    title: "Scene Description",
    tags: [
      "sky",
      "food",
      "drink",
      "flowers",
      "chair",
      "table",
      "desk",
      "lamp",
      "beach",
      "sand",
      "water",
      "shore",
      "grass",
      "stairs",
    ],
    color: "#ffccff",
  },
  {
    title: "Lighting",
    tags: [
      "sunset",
      "strong shadows",
      "golden hour",
      "night",
      "day",
      "raining",
      "snowing",
    ],
    color: "#ffccff",
  },
  {
    title: "Other",
    tags: ["solo", "1girl", "1boy"],
    color: "#ffccff",
  },
];

export function Tagger({ project }: { project: Project }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-pink-100 py-10 pl-10 dark:bg-slate-900">
      <div className="flex h-full w-full flex-col !overflow-y-auto">
        {CATEGORIES.map((category, i) => (
          <TagCategory key={category.title} category={category} i={i} />
        ))}
      </div>
      <ProjectCategoriesModal project={project} />
    </div>
  );
}
