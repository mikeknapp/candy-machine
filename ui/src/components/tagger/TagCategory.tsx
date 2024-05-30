import React from "react";
import { HiPlusCircle } from "react-icons/hi";
import { useRecoilStateLoadable, useRecoilValue } from "recoil";
import {
  currentProjectSelector,
  selectedTagsSelector,
} from "../../state/atoms";
import { Tag } from "./Tag";

export type CategoryData = {
  title: string;
  tags: string[];
  color: string;
};

export function TagCategory({ category }: { category: CategoryData }) {
  const project = useRecoilValue(currentProjectSelector);
  const [selectedTagsLoadable, setSelectedTags] = useRecoilStateLoadable(
    selectedTagsSelector({
      projectName: project.name,
      image: project.selectedImage,
    }),
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return selectedTags.filter((t) => t !== tag);
      } else {
        return [...selectedTags, tag];
      }
    });
  };

  let selectedTags: string[] = [];
  if (selectedTagsLoadable.state === "hasValue") {
    selectedTags = selectedTagsLoadable.contents as string[];
  }

  return (
    <div
      key={category.title}
      className="mb-4 flex w-full flex-col border-b-[1px] border-b-gray-300 pb-4"
    >
      <h2
        className="mb-3 flex flex-row items-center gap-2 border-l-4 pl-2 text-xs font-bold dark:text-white"
        style={{
          borderColor: category.color,
        }}
      >
        {category.title.toUpperCase()}
        <HiPlusCircle className="cursor-pointer text-lg text-gray-500 hover:text-green-500" />
      </h2>
      <div className="flex w-[90%] flex-row flex-wrap items-center gap-2">
        {category.tags.map((tag, i) => (
          <Tag
            key={`${tag}-${i}`}
            text={tag}
            onClick={() => toggleTag(tag)}
            color={category.color}
            isSelected={selectedTags.includes(tag)}
          />
        ))}
      </div>
    </div>
  );
}
