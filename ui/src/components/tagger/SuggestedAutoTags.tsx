import { Dropdown, Tooltip } from "flowbite-react";
import React, { useMemo } from "react";
import { HiInformationCircle, HiMiniPlus, HiXCircle } from "react-icons/hi2";
import { useAppState, useAppValue } from "../../hooks/useApp";
import { Tag } from "./Tag";
import { CategoryData } from "./TagCategory";

const COVERED_BY_TRIGGER = "Covered By Trigger";

export function SuggestedAutoTags() {
  const appValue = useAppValue(
    "project.autoTags",
    "project.tagLayout",
    "project.triggerSynonyms",
  );

  return (
    <>
      {appValue.project.autoTags.map((tag) => (
        <div
          key={`setup-tag-${tag.tag}`}
          className="flex flex-row justify-between p-10"
        >
          <div className="flex flex-row items-center gap-3">
            <Tag text={tag.tag} />

            {tag.examples.length > 0 && (
              <Tooltip
                className="max-w-[300px]"
                content={`A "fill-in" tag helps keep the tag selection screen clean. Examples from your dataset include: ${tag.examples.slice(0, 5).join(", ")}...`}
              >
                <HiInformationCircle className="h-5 w-5 text-gray-400" />
              </Tooltip>
            )}
          </div>

          <ChooseCategoryTagDropdown
            tagLayout={appValue.project.tagLayout}
            tag={tag.tag}
          />
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

function ChooseCategoryTagDropdown({
  tagLayout,
  tag,
}: {
  tagLayout: CategoryData[];
  tag: string;
}) {
  const [appValue, app] = useAppState(
    "project.tagLayout",
    "project.triggerSynonyms",
    "project.triggerWord",
  );

  // The category title, if selected, else "".
  const { title: categoryTitle, color: categoryColor } = useMemo(() => {
    if (appValue.project.triggerSynonyms.includes(tag)) {
      return {
        title: COVERED_BY_TRIGGER,
        color: "#000",
      };
    }
    return (
      tagLayout.find((category) => {
        const hasTag = category.tags.includes(tag);
        if (hasTag) {
          return {
            title: category.title,
            color: category.color,
          };
        }
      }) || { title: "", color: "" }
    );
  }, [tag, tagLayout, appValue.project.triggerSynonyms]);

  return (
    <Dropdown
      size="sm"
      color="light"
      label={
        <div className="flex w-[180px] flex-row items-center justify-between">
          {categoryTitle !== "" ? (
            <>
              <div className="flex flex-row items-center gap-3 text-xs">
                <CategoryIcon color={categoryColor} />
                {categoryTitle}
              </div>
              <HiXCircle
                className="ml-2 h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation();
                  if (categoryTitle === COVERED_BY_TRIGGER) {
                    app.project.toggleTriggerSynonym(tag);
                  } else {
                    app.project.removeTagFromLayout(tag);
                  }
                }}
              />
            </>
          ) : (
            <div className="flex flex-row items-center gap-2 text-xs">
              <HiMiniPlus className="h-5 w-5" /> Add to Category
            </div>
          )}
        </div>
      }
    >
      {appValue.project.triggerWord &&
        (!categoryTitle || categoryTitle == COVERED_BY_TRIGGER) && (
          <Dropdown.Item
            key={`choose-category-${tag}-trigger-word-synonym`}
            onClick={() => {
              app.project.toggleTriggerSynonym(tag);
            }}
            className="flex flex-row gap-2"
          >
            <CategoryIcon color="#000" />
            Covered By Trigger Word
          </Dropdown.Item>
        )}

      {categoryTitle != COVERED_BY_TRIGGER &&
        tagLayout.map((category) => (
          <Dropdown.Item
            key={`choose-category-${tag}-${category.title}`}
            onClick={() =>
              app.project.moveTagtoLayoutCategory(category.title, tag)
            }
            className="flex flex-row gap-2"
          >
            <CategoryIcon color={category.color} />
            {category.title}
          </Dropdown.Item>
        ))}
    </Dropdown>
  );
}
