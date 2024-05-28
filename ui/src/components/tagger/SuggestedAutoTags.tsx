import { Dropdown, Tooltip } from "flowbite-react";
import React, { useMemo } from "react";
import { HiInformationCircle, HiMiniPlus, HiXCircle } from "react-icons/hi2";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  addTagToCategorySelector,
  currentProjectSelector,
  removeTagFromCategorySelector,
  tagLayoutSelector,
} from "../../state/atoms";
import { Tag } from "./Tag";

export function SuggestedAutoTags() {
  const project = useRecoilValue(currentProjectSelector);

  return (
    <>
      {project.autoTags.map((tag) => (
        <div
          key={`setup-tag-${tag.tag}`}
          className="flex flex-row justify-between p-10"
        >
          <div className="flex flex-row items-center gap-3">
            <Tag tag={tag.tag} />

            {tag.examples.length > 0 && (
              <Tooltip
                className="max-w-[300px]"
                content={`A "fill-in" tag helps keep the tag selection screen clean. Examples from your dataset include: ${tag.examples.slice(0, 5).join(", ")}...`}
              >
                <HiInformationCircle className="h-5 w-5 text-gray-400" />
              </Tooltip>
            )}
          </div>

          <ChooseCategoryTagDropdown tag={tag.tag} />
        </div>
      ))}
    </>
  );
}

function CategoryIcon({ color }: { color: string }) {
  return (
    <div
      className="flex h-5 w-5 rounded-full"
      style={{
        backgroundColor: color,
      }}
    />
  );
}

function ChooseCategoryTagDropdown({ tag }: { tag: string }) {
  const tagLayout = useRecoilValue(tagLayoutSelector);
  const addTag = useSetRecoilState(addTagToCategorySelector);
  const removeTag = useSetRecoilState(removeTagFromCategorySelector);

  // The category title, if selected, else "".
  const { title: categoryTitle, color: categoryColor } = useMemo(
    () =>
      tagLayout.find((category) => {
        const hasTag = category.tags.includes(tag);
        if (hasTag) {
          return { title: category.title, color: category.color };
        }
      }) || { title: "", color: "" },
    [tagLayout, tag],
  );

  return (
    <Dropdown
      size="sm"
      color="light"
      label={
        <div className="flex w-[180px] flex-row items-center justify-between">
          {categoryTitle !== "" ? (
            <>
              <div className="flex flex-row gap-3">
                <CategoryIcon color={categoryColor} />
                {categoryTitle}
              </div>
              <HiXCircle
                className="ml-2 h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag({ categoryTitle, tag });
                }}
              />
            </>
          ) : (
            <div className="flex flex-row gap-2">
              <HiMiniPlus className="h-5 w-5" /> Add to Category
            </div>
          )}
        </div>
      }
    >
      {tagLayout.map((category) => (
        <Dropdown.Item
          key={`choose-category-${tag}-${category.title}`}
          onClick={() => {
            if (category.title !== categoryTitle) {
              removeTag({ categoryTitle, tag });
            }
            addTag({ categoryTitle: category.title, tag });
          }}
          className="flex flex-row gap-2"
        >
          <CategoryIcon color={category.color} />
          {category.title}
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
}
