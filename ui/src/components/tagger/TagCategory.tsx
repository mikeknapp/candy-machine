import React, { useEffect, useState } from "react";
import { HiPlusCircle } from "react-icons/hi";
import { useRecoilStateLoadable, useRecoilValue } from "recoil";
import { SelectedImageTags } from "../../models/project";
import {
  currentProjectSelector,
  selectedImgTagsSelector,
} from "../../state/atoms";
import { Tag } from "./Tag";

export type CategoryData = {
  title: string;
  tags: string[];
  color: string;
};

export function TagCategory({ category }: { category: CategoryData }) {
  const [sortedTags, setSortedTags] = useState(category.tags);
  const project = useRecoilValue(currentProjectSelector);
  const [selectedImgTagsLoadable, setSelectedImgTagsTags] =
    useRecoilStateLoadable(
      selectedImgTagsSelector({
        projectName: project.name,
        image: project.selectedImage,
      }),
    );

  const toggleTag = (tag: string) => {
    setSelectedImgTagsTags((prev) => {
      if (prev.selected.includes(tag)) {
        return { ...prev, selected: prev.selected.filter((t) => t !== tag) };
      } else {
        return { ...prev, selected: [...prev.selected, tag] };
      }
    });
  };

  let selectedTags: string[] = [];
  if (selectedImgTagsLoadable.state === "hasValue") {
    let data = selectedImgTagsLoadable.contents as SelectedImageTags;
    if (data?.selected?.length > 0) {
      selectedTags = data.selected;
    }
  }

  useEffect(() => {
    setSortedTags(category.tags);
  }, [category]);

  useEffect(() => {
    if (selectedTags.length == 0) {
      return;
    }
    // Move selected tags to the front of the list.
    setSortedTags((prev) => {
      if (!prev) {
        return prev;
      }
      const selected = prev.filter((tag) => selectedTags.includes(tag)) || [];
      const unselected =
        prev.filter((tag) => !selectedTags.includes(tag)) || [];
      return [...selected, ...unselected];
    });
  }, [selectedImgTagsLoadable]);

  return (
    <div
      key={category.title}
      className="mb-4 flex w-full flex-col border-b-[1px] border-b-gray-300 pb-4 dark:border-b-slate-800"
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
        {sortedTags.map((tag, i) => (
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
