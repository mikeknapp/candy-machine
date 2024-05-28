import { Dropdown, Tooltip } from "flowbite-react";
import React from "react";
import { HiInformationCircle, HiPlusSmall } from "react-icons/hi2";
import { AutoTag } from "../../models/project";
import { Tag } from "./Tag";
import { CATEGORIES } from "./Tagger";

export function SuggestedAutoTags({ tags }: { tags: AutoTag[] }) {
  return (
    <>
      {tags.map((tag) => (
        <div
          key={`setup-tag-${tag.tag}`}
          className="flex flex-row justify-between p-10"
        >
          <div className="flex flex-row items-center gap-3">
            <Tag tag={tag.tag} />

            {tag.examples.length > 0 && (
              <Tooltip
                className="max-w-[300px]"
                content={`This is a fill-in tag. It helps keep the tag selection screen clean. Examples from your dataset include: ${tag.examples.join(", ")}`}
              >
                <HiInformationCircle className="h-5 w-5 text-gray-400" />
              </Tooltip>
            )}
          </div>

          <Dropdown
            size="sm"
            color="light"
            label={
              <div className="flex flex-row items-center">
                <HiPlusSmall className="mr-1 h-5 w-5" /> Add to category
              </div>
            }
          >
            {CATEGORIES.map((category) => (
              <Dropdown.Item key={`${tag}-${category.title}`}>
                {category.title}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>
      ))}
    </>
  );
}
