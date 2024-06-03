import React, { useEffect, useState } from "react";
import { HiPlusCircle } from "react-icons/hi";
import { useRecoilState } from "recoil";
import { useProjectState } from "../../hooks/useProject";
import { findMatchingTags } from "../../models/image";
import { tagSearchTerm } from "../../state/atoms";
import { Tag } from "./Tag";

export type CategoryData = {
  title: string;
  tags: string[];
  color: string;
};

export function TagCategory({ category }: { category: CategoryData }) {
  const [projectValue, project] = useProjectState();
  const [tagSearch, setTagSearch] = useRecoilState(tagSearchTerm);
  const [categoryTags, setCategoryTags] = useState(category.tags);

  let selectedTags = projectValue.selectedImage?.tags || [];

  useEffect(() => {
    // Ensure we have all of the relevant tags for this category, starting with the default layout.
    let relevantTags = new Set<string>(category.tags);

    // Create a new tage for any selected tags that match a broad match tag.
    category.tags.forEach((tagTemplate) => {
      findMatchingTags(tagTemplate, selectedTags).forEach((tag) => {
        relevantTags.add(tag);
      });
    });

    setCategoryTags(Array.from(relevantTags));
  }, [category, tagSearch, selectedTags]);

  useEffect(() => {
    // Sort + apply any active search filter.
    setCategoryTags((prev) => {
      if (!prev) return []; // Wait for tags to load.

      // Move selected tags to the front of the list.
      const selected = prev.filter((tag) => selectedTags.includes(tag)) || [];
      const unselected =
        prev.filter((tag) => !selectedTags.includes(tag)) || [];
      const orderedTags = [...selected, ...unselected];

      // Apply any active search filter.
      if (tagSearch) {
        return orderedTags.filter((tag) =>
          tag.toLowerCase().includes(tagSearch.toLowerCase()),
        );
      }
      return orderedTags;
    });
  }, [categoryTags]);

  if (categoryTags.length === 0) {
    return null;
  }

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
        {categoryTags.map((tag, i) => (
          <Tag
            key={`${tag}-${i}`}
            text={tag}
            onClick={() => {
              project.selectedImage?.toggleTag(tag);
              setTimeout(() => setTagSearch(null), 500);
            }}
            color={category.color}
            isSelected={selectedTags.includes(tag)}
          />
        ))}
      </div>
    </div>
  );
}
