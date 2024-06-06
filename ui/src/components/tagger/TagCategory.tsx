import React, { useContext, useEffect, useState } from "react";
import { HiPlusCircle } from "react-icons/hi";
import { TagSearchContext } from "../../app";
import { useProjectState } from "../../hooks/useProject";
import { findMatchingTags } from "../../models/image";
import { AddTagPopup } from "./AddTagPopup";
import { Tag } from "./Tag";

export type CategoryData = {
  title: string;
  tags: string[];
  color: string;
  hideAddButton?: boolean;
};

const DEFAULT_ADD_TAG_STATE = {
  show: false,
  category: "",
  tagTemplate: "",
};

export function TagCategory({ category }: { category: CategoryData }) {
  const [projectValue, project] = useProjectState();
  const { query, updateTagSearch } = useContext(TagSearchContext);
  const [categoryTags, setCategoryTags] = useState(category.tags);

  // State for adding a tag.
  const [addTag, setAddTag] = useState(DEFAULT_ADD_TAG_STATE);

  const isDisabled = !projectValue.selectedImage?.isLoaded;
  let selectedTags = projectValue.selectedImage?.tags || [];

  useEffect(() => {
    // Ensure we have all of the relevant tags for this category, starting with the default layout.
    let relevantTags = new Set<string>(category.tags);

    // Create a new tag for any selected tags that match a broad match tag.
    category.tags.forEach((tagTemplate) => {
      findMatchingTags(tagTemplate, selectedTags).forEach((tag) => {
        relevantTags.add(tag);
      });
    });

    // Move selected tags to the front of the list.
    const tags = Array.from(relevantTags);
    const selected = tags.filter((t) => selectedTags.includes(t)) || [];
    const unselected = tags.filter((t) => !selectedTags.includes(t)) || [];
    let results = [...selected, ...unselected];

    // Apply any active search filter.
    if (query) {
      results = results.filter((tag) =>
        tag.toLowerCase().includes(query.toLowerCase()),
      );
    }

    // Sort + apply any active search filter.
    setCategoryTags(results);
  }, [projectValue.tagLayout, category, query, selectedTags]);

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
        {!(category?.hideAddButton ?? false) && !isDisabled && (
          <HiPlusCircle
            onClick={() =>
              setAddTag({
                show: true,
                category: category.title,
                tagTemplate: "",
              })
            }
            className="cursor-pointer text-lg text-gray-500 hover:text-green-500"
          />
        )}
      </h2>
      <div className="flex w-[90%] flex-row flex-wrap items-center gap-2">
        {categoryTags.map((tag, i) => (
          <Tag
            key={`${tag}-${i}`}
            text={tag}
            onClick={() => {
              if (tag.includes("{") && tag.includes("}")) {
                setAddTag({
                  show: true,
                  category: category.title,
                  tagTemplate: tag,
                });
              } else {
                project.selectedImage?.toggleTag(tag);
                updateTagSearch("", false, true);
              }
            }}
            color={category.color}
            isSelected={selectedTags.includes(tag)}
            isDisabled={isDisabled}
          />
        ))}
      </div>

      {addTag.show && (
        <AddTagPopup
          show
          onClose={() => {
            setAddTag(DEFAULT_ADD_TAG_STATE);
          }}
          category={addTag.category}
          tagTemplate={addTag.tagTemplate}
        />
      )}
    </div>
  );
}
