import _ from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { HiPlusCircle } from "react-icons/hi";
import { TagSearchContext } from "../../app";
import { findMatchingTags } from "../../models/image";
import { AddTagPopup } from "./AddTagPopup";
import { Tag } from "./Tag";

interface TagCategoryProps {
  isLoading: boolean;
  allSelectedTags: string[];
  category: CategoryData;
  onToggleTag: (tag: string) => void;
}

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

export function TagCategory(props: TagCategoryProps) {
  const [categoryTags, setCategoryTags] = useState(props.category.tags || []);
  const [addTag, setAddTag] = useState(DEFAULT_ADD_TAG_STATE);
  const { tagQuery, updateTagSearch } = useContext(TagSearchContext);

  useEffect(() => {
    let selectedTags = props.allSelectedTags || [];

    // Ensure we have all of the relevant tags for this category, starting with the default layout.
    let relevantTags = new Set<string>(props.category.tags);

    // Create a new tag for any selected tags that match a broad match tag.
    props.category.tags.forEach((tagTemplate) => {
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
    if (tagQuery) {
      results = results.filter((tag) =>
        tag.toLowerCase().includes(tagQuery.toLowerCase()),
      );
    }

    if (!_.isEqual(results, categoryTags)) {
      setCategoryTags(results);
    }
  }, [props.category, tagQuery, props.allSelectedTags]);

  if (categoryTags.length === 0) {
    return null;
  }

  return (
    <div
      key={props.category.title}
      className="mb-4 flex w-full flex-col border-b-[1px] border-b-gray-300 pb-4 dark:border-b-slate-800"
    >
      <h2
        className="mb-3 flex flex-row items-center gap-2 border-l-4 pl-2 text-xs font-bold dark:text-white"
        style={{
          borderColor: props.category.color,
        }}
      >
        {props.category.title.toUpperCase()}
        {!(props.category?.hideAddButton ?? false) && !props.isLoading && (
          <HiPlusCircle
            onClick={() =>
              setAddTag({
                show: true,
                category: props.category.title,
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
                  category: props.category.title,
                  tagTemplate: tag,
                });
              } else {
                props.onToggleTag(tag);
                updateTagSearch("", false, true);
              }
            }}
            color={props.category.color}
            isSelected={props.allSelectedTags.includes(tag)}
            isDisabled={props.isLoading}
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
